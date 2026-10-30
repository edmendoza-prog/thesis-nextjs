/**
 * Universal Document and Lesson Content Parser
 * Robustly extracts plain text from PPTX, PPT, DOCX, DOC, PDF, XLSX, XLS, CSV, JSON, TXT, MD, RTF, etc.
 */

import JSZip from "jszip";
import * as mammoth from "mammoth";

/**
 * Decodes XML character entities (&amp;, &lt;, &gt;, &quot;, &apos;, numeric &#123;, &#xAB;)
 */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      try {
        return String.fromCharCode(parseInt(code, 10));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return "";
      }
    });
}

/**
 * Extracts structured paragraph text from an XML string (PPTX / DOCX / OpenXML).
 */
function extractTextFromXml(xml: string): string {
  const paragraphs: string[] = [];

  // Match all paragraph elements (<a:p>, <w:p>, or <p>)
  const pMatches = xml.match(/<[a-zA-Z0-9:]*p[^>]*>([\s\S]*?)<\/[a-zA-Z0-9:]*p>/gi);

  if (pMatches && pMatches.length > 0) {
    for (const p of pMatches) {
      // Find all text tags (<a:t>, <w:t>, <t>) inside paragraph
      const tMatches = p.match(/<[a-zA-Z0-9:]*t[^>]*>([\s\S]*?)<\/[a-zA-Z0-9:]*t>/gi) || [];
      const line = tMatches
        .map((t) => decodeXmlEntities(t.replace(/<[^>]+>/g, "").trim()))
        .filter(Boolean)
        .join(" ");

      if (line) {
        paragraphs.push(line);
      }
    }

    if (paragraphs.length > 0) {
      return paragraphs.join("\n");
    }
  }

  // Fallback: match any text run tags (<a:t>, <w:t>, <t>)
  const tMatches = xml.match(/<[a-zA-Z0-9:]*t[^>]*>([\s\S]*?)<\/[a-zA-Z0-9:]*t>/gi) || [];
  if (tMatches.length > 0) {
    return tMatches
      .map((t) => decodeXmlEntities(t.replace(/<[^>]+>/g, "").trim()))
      .filter(Boolean)
      .join(" ");
  }

  // Last-resort fallback: strip all tags
  const stripped = decodeXmlEntities(xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  return stripped.length > 5 ? stripped : "";
}

/**
 * Extracts text from PDF files using pdfjs-dist with a local worker and clean ASCII text fallback.
 */
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // 1. Pre-load the worker module so globalThis.pdfjsWorker is registered
    try {
      const workerMod = await import("pdfjs-dist/build/pdf.worker.min.mjs");
      if (typeof globalThis !== "undefined" && workerMod?.WorkerMessageHandler) {
        (globalThis as Record<string, unknown>).pdfjsWorker = {
          WorkerMessageHandler: workerMod.WorkerMessageHandler,
        };
      }
    } catch {
      // Fallback to static worker file in /public
    }

    // 2. Import pdfjs-dist and set GlobalWorkerOptions.workerSrc
    const pdfjsLib = await import("pdfjs-dist");
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    }).promise;
    let fullText = "";

    for (let i = 1; i <= Math.min(pdf.numPages, 40); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: unknown) =>
          item && typeof item === "object" && "str" in item
            ? String((item as { str: unknown }).str)
            : ""
        )
        .join(" ");

      if (pageText.trim()) {
        fullText += `--- Page ${i} ---\n${pageText.trim()}\n\n`;
      }
    }

    if (fullText.trim()) {
      return fullText.trim();
    }
  } catch (err) {
    console.warn("PDFjs extraction fallback to stream text parser:", err);
  }

  // Fallback: Extract readable text literals from PDF stream without binary garbage
  try {
    const raw = new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer));
    const textChunks: string[] = [];

    // Extract text inside parentheses (...) common in uncompressed PDF text blocks
    const parenMatches = raw.match(/\(([^()\\]{3,200})\)/g);
    if (parenMatches) {
      for (const m of parenMatches) {
        const inner = m.slice(1, -1).trim();
        if (
          inner.length >= 3 &&
          /[a-zA-Z]{2,}/.test(inner) &&
          !/^(Type|Font|Page|Catalog|Outlines|Parent|Resources|ProcSet|MediaBox|Filter|FlateDecode|Length|Subtype|BaseFont|Encoding|WinAnsiEncoding|MacRomanEncoding|Creator|Producer|CreationDate|ModDate)/i.test(inner)
        ) {
          textChunks.push(inner);
        }
      }
    }

    if (textChunks.join(" ").trim().length > 30) {
      return textChunks.join(" ").replace(/\s+/g, " ").trim();
    }
  } catch {
    // ignore
  }

  // Final fallback: use file title as topic context rather than raw binary PDF bytes
  const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
  return cleanTitle ? `Lesson Document Topic: ${cleanTitle}` : "";
}

/**
 * Extracts text from PPTX PowerPoint presentations (.pptx, .ppsx, .pptm).
 */
async function extractTextFromPPTX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const slideEntries: { name: string; slideNum: number; content: string }[] = [];
    const notesEntries: { name: string; slideNum: number; content: string }[] = [];
    const otherXmlEntries: { name: string; content: string }[] = [];

    const fileNames = Object.keys(zip.files);

    for (const rawName of fileNames) {
      const normalizedName = rawName.replace(/\\/g, "/").replace(/^\//, "");

      // Check for slide XML
      const slideMatch =
        normalizedName.match(/^ppt\/slides\/slide(\d+)\.xml$/i) ||
        normalizedName.match(/slides\/slide(\d+)\.xml$/i);

      if (slideMatch) {
        const slideNum = parseInt(slideMatch[1], 10) || 0;
        const xml = await zip.files[rawName].async("text");
        slideEntries.push({ name: normalizedName, slideNum, content: xml });
        continue;
      }

      // Check for notes slide XML
      const notesMatch =
        normalizedName.match(/^ppt\/notesSlides\/notesSlide(\d+)\.xml$/i) ||
        normalizedName.match(/notesSlides\/notesSlide(\d+)\.xml$/i);

      if (notesMatch) {
        const slideNum = parseInt(notesMatch[1], 10) || 0;
        const xml = await zip.files[rawName].async("text");
        notesEntries.push({ name: normalizedName, slideNum, content: xml });
        continue;
      }

      // Check for SmartArt, diagrams, or charts
      if (
        normalizedName.includes("diagrams/") ||
        normalizedName.includes("charts/") ||
        (normalizedName.startsWith("ppt/") && normalizedName.endsWith(".xml"))
      ) {
        // Exclude master / layout / theme boilerplate
        if (
          !normalizedName.includes("slideLayout") &&
          !normalizedName.includes("slideMaster") &&
          !normalizedName.includes("theme")
        ) {
          const xml = await zip.files[rawName].async("text");
          otherXmlEntries.push({ name: normalizedName, content: xml });
        }
      }
    }

    // Natural sort slides by slide number
    slideEntries.sort((a, b) => a.slideNum - b.slideNum);
    notesEntries.sort((a, b) => a.slideNum - b.slideNum);

    let fullText = "";

    // 1. Process Slide Content
    if (slideEntries.length > 0) {
      for (const slide of slideEntries) {
        const slideText = extractTextFromXml(slide.content);
        if (slideText.trim()) {
          fullText += `=== Slide ${slide.slideNum} ===\n${slideText.trim()}\n\n`;
        }
      }
    }

    // 2. Process Speaker Notes
    if (notesEntries.length > 0) {
      for (const notes of notesEntries) {
        const notesText = extractTextFromXml(notes.content);
        if (notesText.trim() && !notesText.includes("Slide " + notes.slideNum)) {
          fullText += `[Slide ${notes.slideNum} Speaker Notes]:\n${notesText.trim()}\n\n`;
        }
      }
    }

    // 3. Process diagrams / tables / extra XML if slide text is sparse
    if (fullText.trim().length < 50 && otherXmlEntries.length > 0) {
      for (const extra of otherXmlEntries) {
        const extraText = extractTextFromXml(extra.content);
        if (extraText.trim()) {
          fullText += `${extraText.trim()}\n\n`;
        }
      }
    }

    if (fullText.trim().length > 0) {
      return fullText.trim();
    }
  } catch (err) {
    console.warn("PPTX OpenXML extraction error, falling back to binary scanner:", err);
  }

  // Fallback for legacy .ppt or corrupted packages
  return extractTextFromBinaryOffice(await file.arrayBuffer());
}

/**
 * Extracts text from DOCX Word documents.
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (result.value && result.value.trim().length > 0) {
      return result.value.trim();
    }
  } catch (err) {
    console.warn("Mammoth DOCX extraction error, trying direct XML parser:", err);
  }

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = zip.file("word/document.xml");
    if (docXml) {
      const xml = await docXml.async("text");
      const docText = extractTextFromXml(xml);
      if (docText.trim()) {
        return docText.trim();
      }
    }
  } catch (xmlErr) {
    console.warn("DOCX XML extraction fallback:", xmlErr);
  }

  return extractTextFromBinaryOffice(arrayBuffer);
}

/**
 * Extracts text from XLSX Excel spreadsheets.
 */
async function extractTextFromXLSX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const sharedStringsFile = zip.file("xl/sharedStrings.xml");
    if (sharedStringsFile) {
      const xml = await sharedStringsFile.async("text");
      const extracted = extractTextFromXml(xml);
      if (extracted.trim()) {
        return extracted.trim();
      }
    }
  } catch (err) {
    console.warn("XLSX extraction fallback:", err);
  }

  return extractTextFromBinaryOffice(await file.arrayBuffer());
}

/**
 * Universal binary stream scanner for legacy binary Office formats (.ppt, .doc, .xls, etc.)
 */
function extractTextFromBinaryOffice(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const collectedStrings: string[] = [];

  // Try UTF-16LE decoding (standard for Microsoft Binary Compound Files)
  try {
    const utf16Decoder = new TextDecoder("utf-16le", { fatal: false });
    const text = utf16Decoder.decode(bytes);
    const matches = text.match(/[\w\s.,!?:;'"()\-_+=/\\$#%&*<>@{}]{4,}/g);
    if (matches) {
      const valid = matches
        .map((s) => s.trim())
        .filter((s) => s.length >= 4 && !/^[0-9a-fA-F_]+$/.test(s) && !s.includes("Microsoft"));
      if (valid.length > 0) {
        collectedStrings.push(...valid);
      }
    }
  } catch (e) {
    console.warn("Binary UTF-16 scan error:", e);
  }

  // Try UTF-8 / ASCII decoding
  try {
    const utf8Decoder = new TextDecoder("utf-8", { fatal: false });
    const text = utf8Decoder.decode(bytes);
    const matches = text.match(/[\w\s.,!?:;'"()\-_+=/\\$#%&*<>@{}]{4,}/g);
    if (matches) {
      const valid = matches
        .map((s) => s.trim())
        .filter((s) => s.length >= 4 && !/^[0-9a-fA-F_]+$/.test(s) && !s.includes("Microsoft"));
      if (valid.length > 0) {
        collectedStrings.push(...valid);
      }
    }
  } catch (e) {
    console.warn("Binary UTF-8 scan error:", e);
  }

  const unique = Array.from(new Set(collectedStrings));
  return unique.join("\n");
}

/**
 * Master parser: Extracts text from ANY uploaded lesson/content file.
 */
export async function extractLessonText(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const extension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : "";

  // 1. PDF Documents
  if (extension === ".pdf" || file.type === "application/pdf") {
    return await extractTextFromPDF(file);
  }

  // 2. PowerPoint Presentations (.pptx, .ppt, .ppsx, .pptm, .potx)
  if (
    extension === ".pptx" ||
    extension === ".ppt" ||
    extension === ".ppsx" ||
    extension === ".pptm" ||
    extension === ".potx" ||
    file.type.includes("presentation") ||
    file.type.includes("powerpoint")
  ) {
    return await extractTextFromPPTX(file);
  }

  // 3. Word Documents (.docx, .doc, .dotx, .docm, .rtf)
  if (
    extension === ".docx" ||
    extension === ".doc" ||
    extension === ".dotx" ||
    extension === ".docm" ||
    file.type.includes("wordprocessingml") ||
    file.type.includes("msword")
  ) {
    return await extractTextFromDOCX(file);
  }

  // 4. Excel Spreadsheets (.xlsx, .xlsm, .xls)
  if (
    extension === ".xlsx" ||
    extension === ".xlsm" ||
    extension === ".xls" ||
    file.type.includes("spreadsheetml") ||
    file.type.includes("excel")
  ) {
    return await extractTextFromXLSX(file);
  }

  // 5. Plain Text, Markdown, CSV, JSON, HTML, XML, RTF, etc.
  if (
    [".txt", ".md", ".csv", ".json", ".rtf", ".html", ".xml", ".tsv", ".yaml", ".yml"].includes(
      extension
    ) ||
    file.type.startsWith("text/")
  ) {
    return await file.text();
  }

  // 6. Inspect magic bytes for ZIP archives (PPTX / DOCX / XLSX without extension)
  try {
    const slice = await file.slice(0, 4).arrayBuffer();
    const header = new Uint8Array(slice);
    // PK\x03\x04 (ZIP signature)
    if (header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04) {
      // Try PPTX first, then DOCX
      const pptxResult = await extractTextFromPPTX(file);
      if (pptxResult.trim()) return pptxResult;
      const docxResult = await extractTextFromDOCX(file);
      if (docxResult.trim()) return docxResult;
    }
  } catch {
    // Fall through to binary text scanner
  }

  // 7. General Binary Fallback
  return extractTextFromBinaryOffice(await file.arrayBuffer());
}
