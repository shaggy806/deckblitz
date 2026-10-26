import { defineCard } from "../define.js";

// EDHREC rank 19546. The life loss is part of the effect, not a cost (the
// ruling): a spell that doesn't resolve loses you nothing.
export default defineCard({
  name: "Boon of Erebos",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +2/+0 until end of turn. Regenerate it. You lose 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "regenerate", target: 0 },
      { kind: "lose-life", amount: 2 },
    ],
  },
});
