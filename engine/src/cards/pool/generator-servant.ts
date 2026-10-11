import { defineCard } from "../define.js";

// EDHREC rank 6842.
//
// Rulings:
//   [2018-12-07] An instant or sorcery spell is not a creature spell, even if that spell creates
//     creature tokens.
//   [2018-12-07] If the mana is spent on two different creature spells, each of those spells (and
//     resulting creatures) will gain haste until end of turn.
//   [2018-12-07] If the mana is spent on a noncreature spell that becomes a creature later in the
//     turn, that creature won't have haste.
//   [2018-12-07] If a creature spell has generic mana only in its alternative or additional cost,
//     the creature will still gain haste.
//
// Carnelian Orb of Dragonkind's `spellGains` (rule 106.6): each unit carries
// the rider, so two creature spells paid with it each gain haste.
const TEXT =
  "{T}, Sacrifice this creature: Add {C}{C}. If any of that mana is spent on a creature spell, it gains haste until end of turn. (That creature can attack and {T} as soon as it comes under your control.)";

export default defineCard({
  name: "Generator Servant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spellGains: { spell: { type: "creature" }, keywords: ["haste"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
