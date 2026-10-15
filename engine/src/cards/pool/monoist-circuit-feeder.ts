import { defineCard } from "../define.js";

// Rulings:
//   If one target becomes illegal, the remaining legal one still gets +X/+0
//   or -0/-X. X is calculated only once, as the ability resolves (both steps
//   read it in one resolution with nothing moving between them). Without both
//   a creature you control and a creature an opponent controls to target, the
//   ability is removed from the stack (both slots are required).

const X = { countOf: { type: "artifact", controlledBy: "you" } } as const;
const TEXT =
  "When this creature enters, until end of turn, target creature you control gets +X/+0 and target creature an opponent controls gets -0/-X, where X is the number of artifacts you control.";

export default defineCard({
  name: "Monoist Circuit-Feeder",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Nautilus"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control", "creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: X, toughness: 0, duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 0, toughness: { product: [X, -1] }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
