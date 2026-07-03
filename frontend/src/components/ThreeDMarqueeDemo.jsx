"use client";
import React from 'react';
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

export default function ThreeDMarqueeDemo() {
  const images = [
    "https://res.cloudinary.com/finnovax/image/upload/v1783047664/Screenshot_2026-07-03_075146_wlrphl.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783047663/Screenshot_2026-07-03_075234_sfa78l.png",
    "https://assets.aceternity.com/animated-testimonials.webp",
    "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783047663/Screenshot_2026-07-03_042605_u9faux.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783049321/Screenshot_2026-07-03_085821_j2djca.png",
    "https://assets.aceternity.com/layout-grid.png",
    "https://assets.aceternity.com/flip-text.png",
    "https://assets.aceternity.com/hero-highlight.png",
    "https://assets.aceternity.com/carousel.webp",
    "https://assets.aceternity.com/placeholders-and-vanish-input.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783048824/Screenshot_2026-07-03_085002_lrmztv.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783048549/ChatGPT_Image_Jul_3_2026_08_44_24_AM_pilq3d.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783047662/Screenshot_2026-07-03_075302_zp9zt2.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783047664/Screenshot_2026-07-03_075146_wlrphl.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783047663/Screenshot_2026-07-03_042605_u9faux.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783048824/Screenshot_2026-07-03_085002_lrmztv.png",
    "https://assets.aceternity.com/tabs.png",
    "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
    "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
    "https://assets.aceternity.com/glowing-effect.webp",
    "https://res.cloudinary.com/finnovax/image/upload/v1783049321/Screenshot_2026-07-03_085810_r8el7m.png",
    "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
    "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
    "https://assets.aceternity.com/macbook-scroll.png",
    "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
    "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
    "https://assets.aceternity.com/multi-step-loader.png",
    "https://res.cloudinary.com/finnovax/image/upload/v1783048549/ChatGPT_Image_Jul_3_2026_08_44_24_AM_pilq3d.png",
    "https://assets.aceternity.com/wobble-card.png",
    "https://assets.aceternity.com/world-map.webp",
  ];
  return (
    <div className="mx-auto my-10 max-w-7xl rounded-3xl bg-gray-950/5 p-2 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee images={images} />
    </div>
  );
}
