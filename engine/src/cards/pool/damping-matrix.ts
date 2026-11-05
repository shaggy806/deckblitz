import { defineCard } from "../define.js";

const TEXT = "Activated abilities of artifacts and creatures can't be activated unless they're mana abilities.";

/** Battlefield artifacts and creatures only (its ruling): no `anyZone`, so
 * unearth or bloodrush from other zones stay activatable. */
export default defineCard({
  name: "Damping Matrix",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: {
        who: "each-player",
        abilitiesOf: { typesAnyOf: ["artifact", "creature"] },
        exceptManaAbilities: true,
      },
      text: TEXT,
    },
  ],
});
