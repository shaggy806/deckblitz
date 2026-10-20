import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the front face normally, or the back face
 * (`Catlike Curiosity`, an Aura) from your graveyard for its disturb cost. */
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Mischievous Catgeist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Cat", "Spirit"],
  power: 1,
  toughness: 1,
  text: `${DAMAGE_TEXT}\nDisturb {2}{U} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["Mischievous Catgeist", "Catlike Curiosity"],
  transform: true,
  disturb: { cost: "{2}{U}" },
});
