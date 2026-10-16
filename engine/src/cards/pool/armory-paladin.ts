import { defineCard } from "../define.js";

// EDHREC rank 8459. Fallout.
//
// Cleon, Merry Champion's impulse draw, on casting an Aura or Equipment
// spell. The card is played by the normal rules (the rulings), and the
// permission outlasts Armory Paladin.
const CAST_TEXT =
  "Whenever you cast an Aura or Equipment spell, exile the top card of your library. You may play that card until the end of your next turn.";

export default defineCard({
  name: "Armory Paladin",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Aura", "Equipment"] } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
