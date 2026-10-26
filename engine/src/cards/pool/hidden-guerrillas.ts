import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 26260.
//
// Rulings:
//   [2004-10-04] It changes into a creature even if the spell is countered.
//   [2004-10-04] When it turns into a creature, it is no longer an enchantment.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.
// Hidden Spider's shape: an intervening-if (rule 603.4), and `setTypes`
// makes it a creature and no longer an enchantment, for good.

const TEXT =
  "When an opponent casts an artifact spell, if this permanent is an enchantment, it becomes a 5/3 Soldier creature with trample.";

export default defineCard({
  name: "Hidden Guerrillas",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "artifact" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 3,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Soldier"],
        keywords: ["trample"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
