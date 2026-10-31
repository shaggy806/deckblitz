import { defineCard } from "../define.js";

// The second mode takes loyalty counters off (not damage): two from each
// planeswalker, or as many as one with fewer has.

const SHRINK_TEXT = "All creatures get -2/-2 until end of turn.";
const LOYALTY_TEXT = "Remove two loyalty counters from each planeswalker.";

export default defineCard({
  name: "Pestilent Haze",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${SHRINK_TEXT}\n• ${LOYALTY_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SHRINK_TEXT,
        effect: { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
      },
      {
        text: LOYALTY_TEXT,
        effect: { kind: "remove-counter-all", filter: { type: "planeswalker" }, counter: "loyalty", amount: 2 },
      },
    ],
  },
});
