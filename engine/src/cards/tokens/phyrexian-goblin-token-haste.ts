import { defineCard } from "../define.js";

/** 1/1 red Phyrexian Goblin with haste — Chancellor of the Forge's token. */
export default defineCard({
  name: "Phyrexian Goblin Token (Haste)",
  art: "01e437a1-6d74-4006-8598-06284444c837",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Goblin"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
});
