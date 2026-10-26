import { defineCard } from "../define.js";

// EDHREC rank 29746.
//
// Rulings:
//   It triggers when the spell is cast, which means it becomes a creature before that spell
//     resolves.
//   It changes into a creature even if the spell is countered.
//   When it turns into a creature, it is no longer an enchantment.
//   A "creature spell" is any spell with the type Creature, even if it has other types such as
//     Artifact or Enchantment.
//   A noncreature permanent that turns into a creature can attack, and its {T} abilities can be
//     activated, only if its controller has continuously controlled that permanent since the
//     beginning of their most recent turn.
//
// Hidden Spider's shape: "if this permanent is an enchantment" is an
// intervening-if (rule 603.4); `setTypes` ends it being one.
const TEXT =
  "When an opponent casts a creature spell, if this permanent is an enchantment, it becomes a 5/5 Angel creature with flying and vigilance.";

export default defineCard({
  name: "Opal Archangel",
  manaCost: "{4}{W}",
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
        power: 5,
        toughness: 5,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Angel"],
        keywords: ["flying", "vigilance"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
