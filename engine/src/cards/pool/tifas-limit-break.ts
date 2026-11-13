import { defineCard } from "../define.js";

// Tiered (rule 702.183a), Thunder Magic's shape. Doubling and tripling add
// +X/+Y, X its power (twice it, tripled) and Y its toughness as it resolves,
// a negative one used as it is (rule 701.10d, the ruling).
const SOMERSAULT = "• Somersault — {0} — Target creature gets +2/+2 until end of turn.";
const METEOR = "• Meteor Strikes — {2} — Double target creature's power and toughness until end of turn.";
const FINAL = "• Final Heaven — {6}{G} — Triple target creature's power and toughness until end of turn.";

export default defineCard({
  name: "Tifa's Limit Break",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Tiered (Choose one additional cost.)\n${SOMERSAULT}\n${METEOR}\n${FINAL}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SOMERSAULT,
        spreeCost: "{0}",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      },
      {
        text: METEOR,
        spreeCost: "{2}",
        targets: ["creature"],
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { powerOf: 0, doubling: true },
          toughness: { toughnessOf: 0, doubling: true },
          duration: "end-of-turn",
        },
      },
      {
        text: FINAL,
        spreeCost: "{6}{G}",
        targets: ["creature"],
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { product: [2, { powerOf: 0, doubling: true }] },
          toughness: { product: [2, { toughnessOf: 0, doubling: true }] },
          duration: "end-of-turn",
        },
      },
    ],
  },
});
