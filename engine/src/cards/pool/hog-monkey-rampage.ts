import { defineCard } from "../define.js";

// The power check is made as it resolves; then the two fight (rule 701.14).
export default defineCard({
  name: "Hog-Monkey Rampage",
  manaCost: "{1}{R/G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Choose target creature you control and target creature an opponent controls. Put a +1/+1 counter on the creature you control if it has power 4 or greater. Then those creatures fight each other. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { power: { op: "gte", n: 4 } } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
