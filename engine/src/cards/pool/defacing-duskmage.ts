import { defineCard } from "../define.js";

// EDHREC rank 8083. A preparation card (rule 722): its prepare spell is
// Vandal's Edit, which is no card of its own. "Their second card each turn"
// is the drawing player's own count — the first needn't have been drawn
// while you controlled this (the ruling).
const DRAW_TEXT = "Whenever an opponent draws their second card each turn, this creature becomes prepared.";

export default defineCard({
  name: "Defacing Duskmage",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Dog", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  prepareSpell: "Vandal's Edit",
  text: `Deathtouch\n${DRAW_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "draws", who: "opponent", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
