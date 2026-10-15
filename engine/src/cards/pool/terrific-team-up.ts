import { defineCard } from "../define.js";

// "One or two target creatures you control": the first slot required, the
// second optional and different. The pump lands first, then both deal their
// (pumped) power to the third target at once — Allies at Last's one-sided
// fights in a simultaneous sequence.
export default defineCard({
  name: "Terrific Team-Up",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if you control a permanent with mana value 4 or greater.\nOne or two target creatures you control each get +1/+0 until end of turn. They each deal damage equal to their power to target creature an opponent controls.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { manaValue: { op: "gte", n: 4 } }, atLeast: 1 },
    reduceGeneric: 2,
  },
  targets: [
    "creature-you-control",
    { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slots: [0] } } },
    "creature-an-opponent-controls",
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 0, duration: "end-of-turn" },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "fight", a: 0, b: 2, oneSided: true },
          { kind: "fight", a: 1, b: 2, oneSided: true },
        ],
      },
    ],
  },
});
