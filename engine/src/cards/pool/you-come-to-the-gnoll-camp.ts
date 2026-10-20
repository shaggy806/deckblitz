import { defineCard } from "../define.js";

// EDHREC rank 18084.
const INTIMIDATE_MODE = "Intimidate Them — Up to two target creatures can't block this turn.";
const FEND_MODE = "Fend Them Off — Target creature gets +3/+1 until end of turn.";

export default defineCard({
  name: "You Come to the Gnoll Camp",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${INTIMIDATE_MODE}\n• ${FEND_MODE}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: INTIMIDATE_MODE,
        targets: [
          { kind: "optional", of: "creature" },
          { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "restrict", target: 0, restrictions: ["cant-block"] },
            { kind: "restrict", target: 1, restrictions: ["cant-block"] },
          ],
        },
      },
      {
        text: FEND_MODE,
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
      },
    ],
  },
});
