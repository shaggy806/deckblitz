import { defineCard } from "../define.js";

/** 2/1 black Phyrexian Wurm with lifelink — Wurmcoil Larva's token. */
export default defineCard({
  name: "Phyrexian Wurm Token (Wurmcoil Larva, Lifelink)",
  art: "1482ab42-875c-46fc-aa0b-b18154488985",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Wurm"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink",
});
