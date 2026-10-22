import { defineCard } from "../define.js";

// One mode targets, so this is a cast-time `castModal` (Abrade's shape). The
// second mode is a `restrict` by filter — a rule for the rest of the turn, so
// a creature without flying that enters later can't block either (the
// card's ruling; rule 611.2c).
export default defineCard({
  name: "Destructive Tampering",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target artifact.\n• Creatures without flying can't block this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Creatures without flying can't block this turn.",
        targets: [],
        effect: {
          kind: "restrict",
          filter: { type: "creature", notKeyword: "flying" },
          restrictions: ["cant-block"],
        },
      },
    ],
  },
});
