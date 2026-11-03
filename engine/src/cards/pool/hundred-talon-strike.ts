import { defineCard } from "../define.js";

export default defineCard({
  name: "Hundred-Talon Strike",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: {
    onto: "arcane",
    cost: "",
    also: {
      text: "Tap an untapped white creature you control",
      tapUntapped: { filter: { type: "creature", colors: ["W"] }, count: 1 },
    },
  },
  text: "Target creature gets +1/+0 and gains first strike until end of turn.\nSplice onto Arcane—Tap an untapped white creature you control. (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
