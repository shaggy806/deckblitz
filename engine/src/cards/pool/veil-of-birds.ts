import { defineCard } from "../define.js";

// EDHREC rank 28620.
//
// Rulings:
//   It triggers when the spell is cast, which means it becomes a creature before that spell
//     resolves.
//   When it turns into a creature, it is no longer an enchantment.
//   It changes into a creature even if the spell is countered.
//   A noncreature permanent that turns into a creature can attack, and its {T} abilities can be
//     activated, only if its controller has continuously controlled that permanent since the
//     beginning of their most recent turn.
//
// Hidden Spider's shape: "if this permanent is an enchantment" is an
// intervening-if (rule 603.4); `setTypes` ends it being one.
const TEXT = "When an opponent casts a spell, if this permanent is an enchantment, it becomes a 1/1 Bird creature with flying.";

export default defineCard({
  name: "Veil of Birds",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 1,
        toughness: 1,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Bird"],
        keywords: ["flying"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
