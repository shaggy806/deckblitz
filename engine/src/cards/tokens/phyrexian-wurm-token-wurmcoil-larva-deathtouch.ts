import { defineCard } from "../define.js";

/** 1/2 black Phyrexian Wurm with deathtouch — Wurmcoil Larva's token. */
export default defineCard({
  name: "Phyrexian Wurm Token (Wurmcoil Larva, Deathtouch)",
  art: "1a7800c9-6808-4f33-87ad-50ad8c79f2d7",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Wurm"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch",
});
