"use client";

import { useEffect, useState } from "react";
import { OpeningScene } from "@/sections/OpeningScene";
import { SmoothScroll } from "@/components/SmoothScroll";
import { IntroSection } from "@/sections/IntroSection";
import { CountdownSection } from "@/sections/CountdownSection";
import { DetailsSection } from "@/sections/DetailsSection";
import { RsvpSection } from "@/sections/RsvpSection";
import { FooterSection } from "@/sections/FooterSection";

/**
 * Owns the single piece of shared state the whole page hinges on:
 * whether the invitation has been opened. Scrolling is locked to the
 * opening scene until the seal breaks; afterward the rest of the story
 * mounts below and smooth-scroll takes over.
 */
export function ExperienceShell() {
  const [opened, setOpened] = useState(false);

  // Lock the document to the opening scene until the seal is broken.
  useEffect(() => {
    if (opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  return (
    <>
      <OpeningScene onOpened={() => setOpened(true)} />

      {opened && (
        <SmoothScroll>
          <div className="relative">
            <IntroSection />
            <CountdownSection />
            <DetailsSection />
            <RsvpSection />
            <FooterSection />
          </div>
        </SmoothScroll>
      )}
    </>
  );
}
