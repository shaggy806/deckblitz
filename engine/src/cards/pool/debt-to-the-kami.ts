import { defineCard } from "../define.js";

// EDHREC rank 15712. Each mode targets the opponent, so the modes are chosen
// as it's cast; what they exile is their choice as it resolves (Imperial
// Edict's shape).

const CREATURE = "Target opponent exiles a creature they control.";
const ENCHANTMENT = "Target opponent exiles an enchantment they control.";

export default defineCard({
  name: "Debt to the Kami",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Choose one —\n• ${CREATURE}\n• ${ENCHANTMENT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: CREATURE,
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "vote",
              choose: true,
              who: { target: 0 },
              for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
            },
            { kind: "for-each-voted", which: "voted", effect: { kind: "exile", target: 0 } },
          ],
        },
      },
      {
        text: ENCHANTMENT,
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "vote",
              choose: true,
              who: { target: 0 },
              for: { permanent: { type: "enchantment", controlledBy: "you" }, own: true },
            },
            { kind: "for-each-voted", which: "voted", effect: { kind: "exile", target: 0 } },
          ],
        },
      },
    ],
  },
});
