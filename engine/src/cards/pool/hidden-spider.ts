import { defineCard } from "../define.js";

// EDHREC rank 20983.
//
// Rulings:
//   [2004-10-04] When it turns into a creature, it is no longer an enchantment.
//   [2008-05-01] The ability only triggers if the creature spell has flying, regardless of whether
//     an effect would cause the creature to have flying once it entered.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.
//
// "If this permanent is an enchantment" is an intervening-if (rule 603.4);
// `setTypes` makes it a creature and no longer an enchantment, for good.

export default defineCard({
  name: "Hidden Spider",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "When an opponent casts a creature spell with flying, if this permanent is an enchantment, it becomes a 3/5 Spider creature with reach. (It can block creatures with flying.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature", keyword: "flying" } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 5,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Spider"],
        keywords: ["reach"],
        duration: "permanent",
      },
      resolve: null,
      text: "When an opponent casts a creature spell with flying, if this permanent is an enchantment, it becomes a 3/5 Spider creature with reach.",
    },
  ],
});
