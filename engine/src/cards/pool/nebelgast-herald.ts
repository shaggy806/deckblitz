import { defineCard } from "../define.js";

// EDHREC rank 11469.
//
// Rulings:
//   - If Nebelgast Herald and another Spirit enter at the same time, its last
//     ability triggers once for each of them.
//
// "This creature or another Spirit you control enters" is Lossarnach
// Captain's pair of triggers: one for itself, one (`otherOnly`) for any other
// Spirit.

const TAP_TEXT = "Whenever this creature or another Spirit you control enters, tap target creature an opponent controls.";

export default defineCard({
  name: "Nebelgast Herald",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { subtype: "Spirit" } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
