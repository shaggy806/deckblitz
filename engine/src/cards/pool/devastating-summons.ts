import { defineCard } from "../define.js";

// X is the number of lands sacrificed as the spell is cast — zero is allowed,
// making two 0/0s that die at once (the ruling).
export default defineCard({
  name: "Devastating Summons",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice X lands.\nCreate two X/X red Elemental creature tokens.",
  additionalCost: { sacrifice: { type: "land" }, sacrificeCount: "x" },
  targets: [],
  effect: {
    kind: "create-token",
    token: "X/X Red Elemental Token",
    count: 2,
    basePt: { power: "x", toughness: "x" },
  },
});
