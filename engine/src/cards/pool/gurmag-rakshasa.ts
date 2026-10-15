import { defineCard } from "../define.js";

// EDHREC rank 21757.
//
// Rulings:
//   [2025-04-04] If you can’t target a creature an opponent controls and a creature you control
//     when Gurmag Rakshasa’s last ability triggers, the ability won’t be put onto the stack.

const MENACE_TEXT = "Menace (This creature can't be blocked except by two or more creatures.)";
const ENTER_TEXT =
  "When this creature enters, target creature an opponent controls gets -2/-2 until end of turn and target creature you control gets +2/+2 until end of turn.";

export default defineCard({
  name: "Gurmag Rakshasa",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: `${MENACE_TEXT}\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Both targets are required: without one of them the ability isn't put
      // on the stack at all (rule 603.3d, the ruling).
      targets: ["creature-an-opponent-controls", "creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
