import { defineCard } from "../define.js";

// A 2/2 green Monkey — Monkey Cage's token. Scryfall has no token printing of
// it (checked 2026-10-27: the only Monkey tokens are the legendary Ragavans).
export default defineCard({
  name: "Monkey Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Monkey"],
  power: 2,
  toughness: 2,
});
