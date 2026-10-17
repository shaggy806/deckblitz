import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Moment of Valor's first mode can target an untapped creature. It still gets
//     +1/+0 and gains indestructible until end of turn.

const UNTAP = "Untap target creature. It gets +1/+0 and gains indestructible until end of turn.";
const DESTROY = "Destroy target creature with power 4 or greater.";

export default defineCard({
  name: "Moment of Valor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${UNTAP}\n• ${DESTROY}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        targets: ["creature"],
        text: UNTAP,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: 0 },
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
      },
      {
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        text: DESTROY,
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
