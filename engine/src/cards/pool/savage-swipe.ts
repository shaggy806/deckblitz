import { defineCard } from "../define.js";

// Rulings: the +2/+2 needs its power to be exactly 2 as Savage Swipe resolves,
// and it fights either way; with the creature you don't control an illegal
// target it still gets the +2/+2, but nobody fights (rule 701.14b).
export default defineCard({
  name: "Savage Swipe",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control gets +2/+2 until end of turn if its power is 2. Then it fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { power: { op: "eq", n: 2 } } },
        then: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
