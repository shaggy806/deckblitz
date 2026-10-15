import { defineCard } from "../define.js";

// EDHREC rank 29993.

const TEAM_MODE = "Creatures you control get +2/+0 until end of turn.";
const ONE_MODE = "Target creature gets +2/+0 and gains first strike until end of turn. Put a +1/+1 counter on it.";

export default defineCard({
  name: "Charge the Sanctum",
  manaCost: "{2}{R/W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: `Choose one —\n• ${TEAM_MODE}\n• ${ONE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: TEAM_MODE,
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 2,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        text: ONE_MODE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          ],
        },
      },
    ],
  },
});
