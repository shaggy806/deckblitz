import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 18609.
//
// Tezzeret's Touch's animation (layer 4 type, layer 7b base P/T), without its return trigger.
//
// Rulings:
//   [2014-07-18] Effects that modify a creature's power and/or toughness, such as the ones created
//     by Titanic Growth or a +1/+1 counter, will apply to the creature no matter when they started
//     to take effect.
//   [2014-07-18] If the artifact was already a creature, its base power and toughness will each
//     become 5. This overwrites any previous effects that set the creature's base power and
//     toughness to specific values.
//   [2014-07-18] The artifact retains any types, subtypes, or supertypes it has. Notably, if an
//     Equipment becomes an artifact creature, it usually can't be attached to another creature.

const ANIMATE =
  "Enchanted artifact is a creature with base power and toughness 5/5 in addition to its other types.";

export default defineCard({
  name: "Ensoul Artifact",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${ANIMATE}`,
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      text: ANIMATE,
    },
  ],
});
