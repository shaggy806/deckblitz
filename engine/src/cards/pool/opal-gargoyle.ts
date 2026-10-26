import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 30678.
//
// Rulings:
//   [2004-10-04] When it turns into a creature, it is no longer an enchantment.
//   [2004-10-04] It changes into a creature even if the spell is countered.
//   [2004-10-04] It triggers when the spell is cast, which means it becomes a creature before that
//     spell resolves.
//   [2008-04-01] A "creature spell" is any spell with the type Creature, even if it has other
//     types such as Artifact or Enchantment.
//
// Hidden Spider's shape: an intervening-if (rule 603.4) and `setTypes`.

const TEXT =
  "When an opponent casts a creature spell, if this permanent is an enchantment, it becomes a 2/2 Gargoyle creature with flying.";

export default defineCard({
  name: "Opal Gargoyle",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Gargoyle"],
        keywords: ["flying"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
