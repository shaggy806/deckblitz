import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 30827. Opal Caryatid's shape.
//
// Rulings:
//   [2004-10-04] It triggers when the spell is cast, so it becomes a creature before the spell
//     resolves. It changes into a creature even if the spell is countered.
//   [2004-10-04] When it turns into a creature, it is no longer an enchantment.
//   [2008-04-01] A "creature spell" is any spell with the type Creature.

const TEXT =
  "When an opponent casts a creature spell, if this permanent is an enchantment, it becomes a 3/3 Knight creature with first strike.";

export default defineCard({
  name: "Opal Champion",
  manaCost: "{2}{W}",
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
        power: 3,
        toughness: 3,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Knight"],
        keywords: ["first-strike"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
