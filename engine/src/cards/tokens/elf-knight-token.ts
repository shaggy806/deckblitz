import { defineCard } from "../define.js";

/** 2/2 green and white Elf Knight with vigilance — Guilds of Ravnica's Selesnya token. */
export default defineCard({
  name: "Elf Knight Token",
  art: "74506297-41ad-40e5-bb05-175650ff4907",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance",
});
