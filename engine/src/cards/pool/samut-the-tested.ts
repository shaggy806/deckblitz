import { defineCard } from "../define.js";

// EDHREC rank 17985.
//
// Rulings:
//   While resolving Samut's last ability, all of the creatures and
//   planeswalkers put onto the battlefield this way enter at the same time.
//   If Samut's second ability has two targets and one becomes an illegal
//   target, the remaining target is dealt 1 damage, not 2.
//   You divide the damage as you activate Samut's second ability, not as it
//   resolves. Each target must be assigned at least 1 damage.
//
// The −2 is Ral, Caller of Storms's division; the −7's finds enter as one
// event (a tutor's finds always do).

export default defineCard({
  name: "Samut, the Tested",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Samut"],
  loyalty: 4,
  text:
    "+1: Up to one target creature gains double strike until end of turn.\n−2: Samut deals 2 damage divided as you choose among one or two targets.\n−7: Search your library for up to two creature and/or planeswalker cards, put them onto the battlefield, then shuffle.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: "+1: Up to one target creature gains double strike until end of turn.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
      divided: { total: 2, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: "−2: Samut deals 2 damage divided as you choose among one or two targets.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        destination: "battlefield",
        min: 0,
        max: 2,
      },
      resolve: null,
      text: "−7: Search your library for up to two creature and/or planeswalker cards, put them onto the battlefield, then shuffle.",
    },
  ],
});
