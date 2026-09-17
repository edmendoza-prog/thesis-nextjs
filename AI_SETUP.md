# AI Integration Setup Guide

## OpenAI API Configuration

This project uses OpenAI's API for:
- **Auto-translation** of lesson content to simple English
- **Exam question generation** based on lesson content and criteria weights

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy your API key (starts with `sk-`)

### 2. Add API Key to Your Project

1. Open the `.env.local` file in the root directory
2. Replace `your_openai_api_key_here` with your actual API key:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview
```

### 3. Restart Your Development Server

After adding your API key, restart the Next.js development server:

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Usage

### Auto-Translation

1. Navigate to **Create Activity** page
2. Paste your lesson content in any language
3. Click **"Auto-Translate to English"**
4. The AI will translate it to simple, elementary-student-friendly English

### Generate Exam Questions

1. Ensure your criteria weights total exactly **100%**
2. Enter your translated lesson text
3. Set the number of questions you want (1-50)
4. Click **"Generate Exam Questions"**
5. The AI will create multiple-choice questions distributed according to your criteria weights

## API Costs

- Translation: ~$0.01 - $0.03 per request (depending on text length)
- Question Generation: ~$0.05 - $0.15 per request (depending on question count)

**Recommended**: Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Troubleshooting

### "API key is missing" Error

- Verify `.env.local` exists in the root directory
- Ensure `OPENAI_API_KEY` is set correctly (no extra spaces)
- Restart your dev server after adding the key

### "Invalid API key" Error

- Check that your API key starts with `sk-`
- Verify the key hasn't been revoked in OpenAI dashboard
- Ensure you have billing set up on your OpenAI account

### Questions Don't Match Criteria

- Make sure your lesson content is clear and detailed
- Verify criteria names are descriptive
- Try adjusting the question count (more questions = better distribution)

## Supported Models

By default, the system uses `gpt-4-turbo-preview`. You can change this in `.env.local`:

```env
# Faster and cheaper (good for testing)
OPENAI_MODEL=gpt-3.5-turbo

# More advanced (better quality)
OPENAI_MODEL=gpt-4-turbo-preview

# Most advanced (highest quality, most expensive)
OPENAI_MODEL=gpt-4
```

## Security Notes

- ✅ `.env.local` is in `.gitignore` (not committed to git)
- ✅ API key is only used server-side (never exposed to browser)
- ✅ API calls are made through Next.js API routes (secure)

**Never commit your `.env.local` file or share your API key publicly!**

## File Structure

```
thesis-nextjs/
├── .env.local                              # Your API key (DO NOT commit)
├── app/
│   ├── (teacher)/
│   │   └── create-activity/
│   │       └── page.tsx                    # Updated with API integration
│   └── api/
│       └── ai/
│           └── generate/
│               └── route.ts                # API endpoint for AI calls
```

## Next Steps

1. **Add your API key** to `.env.local`
2. **Restart the dev server**
3. **Test translation** with a sample lesson
4. **Generate questions** to verify everything works
5. **Monitor usage** on OpenAI dashboard

Need help? Check the console logs or inspect Network tab in browser DevTools for detailed error messages.
