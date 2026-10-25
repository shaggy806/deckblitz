import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 17262.
//
// "That player" is the opponent whose turn it is: the active player.
const TEXT = "At the beginning of combat on each opponent's turn, tap target creature that player controls.";

export default defineCard({
  name: "Sentinel of the Eternal Watch",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 4,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "opponent" },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
