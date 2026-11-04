import { defineCard } from "../define.js";

export default defineCard({
  name: "Reverse the Polarity",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Counter all other spells.\n" +
    "• Switch each creature's power and toughness until end of turn.\n" +
    "• Creatures can't be blocked this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter all other spells.",
        effect: { kind: "for-each-on-stack", spells: true, effect: { kind: "counter", target: 0 } },
      },
      {
        text: "Switch each creature's power and toughness until end of turn.",
        effect: { kind: "switch-pt", all: { type: "creature" }, duration: "end-of-turn" },
      },
      {
        text: "Creatures can't be blocked this turn.",
        effect: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-be-blocked"] },
      },
    ],
  },
});
