"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PaloseboRaceGame from "../PaloseboRaceGame";

export default function PaloseboStandalonePage() {
  const router = useRouter();

  return (
    <PaloseboRaceGame
      onClose={() => {
        router.push("/live-class-activities");
      }}
    />
  );
}
