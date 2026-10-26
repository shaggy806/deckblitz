import { defineCard } from "../define.js";

/** 4/4 red and green Giant Warrior with haste — Giantbaiting's token. */
export default defineCard({
  name: "Giant Warrior Token",
  art: "a06eea30-810b-4623-9862-ec71c4bed11a",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste",
});
