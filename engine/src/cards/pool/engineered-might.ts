import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 26859.
//
// The second mode's creatures are fixed as it resolves (the ruling).
const PUMP_MODE = "Target creature gets +5/+5 and gains trample until end of turn.";
const TEAM_MODE = "Creatures you control get +2/+2 and gain vigilance until end of turn.";

export default defineCard({
  name: "Engineered Might",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: `Choose one —\n• ${PUMP_MODE}\n• ${TEAM_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: PUMP_MODE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: TEAM_MODE,
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: 2,
              toughness: 2,
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "vigilance",
              duration: "end-of-turn",
            },
          ],
        },
      },
    ],
  },
});
