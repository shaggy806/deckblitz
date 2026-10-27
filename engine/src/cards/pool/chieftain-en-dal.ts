import { defineCard } from "../define.js";

// EDHREC rank 26169.
//
// Rulings:
//   Chieftain en-Dal does give itself first strike when attacking.

const TEXT = "Whenever this creature attacks, attacking creatures gain first strike until end of turn.";

export default defineCard({
  name: "Chieftain en-Dal",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
