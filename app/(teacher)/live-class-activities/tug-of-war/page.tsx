"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TugOfWarGame from "../TugOfWarGame";

export default function TugOfWarStandalonePage() {
  const router = useRouter();

  return (
    <TugOfWarGame
      onClose={() => {
        router.push("/live-class-activities");
      }}
    />
  );
}
