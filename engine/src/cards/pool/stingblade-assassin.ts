import { defineCard } from "../define.js";

// EDHREC rank 15116.
//
// Rooftop Assassin's enters trigger, word for word.

const ENTER_TEXT = "When this creature enters, destroy target creature an opponent controls that was dealt damage this turn.";

export default defineCard({
  name: "Stingblade Assassin",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Assassin"],
  power: 3,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
