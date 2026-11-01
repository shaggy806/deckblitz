import { defineCard } from "../define.js";

// "Permanents your opponents control", face down or not, during your turn: no
// turn-face-up special action, nor an effect, can turn one. An opponent's turn
// is free, and so are your own face-down permanents.

const STATIC = "Permanents your opponents control can't be turned face up during your turn.";
const ATTACK = "Whenever you attack with three or more creatures, creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Karlov Watchdog",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${STATIC}\n${ATTACK}`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "opponent" } },
      condition: { kind: "your-turn" },
      restrictions: ["cant-turn-face-up"],
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 3 },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
