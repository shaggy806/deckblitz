import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 30784. Hidden Spider's shape.
//
// Rulings:
//   It triggers when the spell is cast, which means it becomes a creature before that spell
//     resolves; it changes into a creature even if the spell is countered.
//   When it turns into a creature, it is no longer an enchantment.
//   A "creature spell" is any spell with the type Creature, even if it has other types.

const TEXT =
  "When an opponent casts a creature spell, if this permanent is an enchantment, it becomes a 2/2 Soldier creature.";

export default defineCard({
  name: "Opal Caryatid",
  manaCost: "{W}",
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
        setSubtypes: ["Soldier"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
