import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 27852.
//
// Rulings:
//   [2004-10-04] When it turns into a creature, it is no longer an enchantment.
//   [2004-10-04] It changes into a creature even if the spell is countered.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.
//
// Hidden Spider's shape: an intervening-if (rule 603.4) and `setTypes`.

const TEXT =
  "When an opponent casts an enchantment spell, if this permanent is an enchantment, it becomes a 5/5 Treefolk creature.";

export default defineCard({
  name: "Hidden Ancients",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "enchantment" } },
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
        setSubtypes: ["Treefolk"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
