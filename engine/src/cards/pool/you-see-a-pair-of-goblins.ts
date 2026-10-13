import { defineCard } from "../define.js";

// EDHREC rank 7069.
// Goblin Surprise's modes under names.
const CHARGE_MODE = "Charge Them — Creatures you control get +2/+0 until end of turn.";
const BEFRIEND_MODE = "Befriend Them — Create two 1/1 red Goblin creature tokens.";

export default defineCard({
  name: "You See a Pair of Goblins",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${CHARGE_MODE}\n• ${BEFRIEND_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: CHARGE_MODE,
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 2,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        text: BEFRIEND_MODE,
        effect: { kind: "create-token", token: "Goblin Token", count: 2 },
      },
    ],
  },
});
