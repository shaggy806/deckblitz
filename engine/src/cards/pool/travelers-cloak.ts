import { defineCard } from "../define.js";
import { LAND_TYPES } from "../helpers.js";

// EDHREC rank 15169. "A land type" is any that exists (rule 205.3i), Island's
// walk being islandwalk (`StaticAbility.landwalk`).

export default defineCard({
  name: "Traveler's Cloak",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAs this Aura enters, choose a land type.\nWhen this Aura enters, draw a card.\nEnchanted creature has landwalk of the chosen type. (It can't be blocked as long as defending player controls a land of that type.)",
  targets: ["creature"],
  chooseOnEnter: LAND_TYPES,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      landwalk: "chosen-land-type",
      text: "Enchanted creature has landwalk of the chosen type.",
    },
  ],
});
