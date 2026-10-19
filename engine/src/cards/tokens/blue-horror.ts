import { defineCard } from "../define.js";

/**
 * Pink Horror's token — "2/2 blue and red Demon Horror creature tokens named
 * Blue Horror with 'Whenever you cast an instant or sorcery spell, this token
 * deals 1 damage to any target.'" A named token whose name collides with no
 * card, so it's keyed by that name (Cadet's shape).
 */
const TEXT = "Whenever you cast an instant or sorcery spell, this token deals 1 damage to any target.";

export default defineCard({
  name: "Blue Horror",
  art: "4a3d2013-e10c-49aa-adf6-4a3a141e48ce",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Demon", "Horror"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
