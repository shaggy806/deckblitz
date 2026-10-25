import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 9621.
//
// The first and third abilities' type changes have no duration (`"permanent"` — the first
// ruling). The −7's lands are the ones the search put onto the battlefield this resolution
// (`thisWay: "put-onto-battlefield"`, Fabled Passage's shape).
//
// Rulings:
//   [2014-07-18] The type-changing effects of the first and third abilities don’t have a duration.
//     They last indefinitely.
//   [2014-07-18] If the land targeted by the first ability entered the battlefield this turn, it
//     won’t be able to attack and its activated abilities with {T} in the cost (including its mana
//     ability) can’t be activated (unless something gives it haste). The same is true for the
//     lands put onto the battlefield with the third ability.

const PLUS_ONE = "+1: Target land you control becomes a 4/4 Elemental creature with trample. It's still a land.";
const UNTAP = "+1: Untap up to four target Forests.";
const ULT =
  "−7: Search your library for any number of basic land cards, put them onto the battlefield, then shuffle. Those lands become 4/4 Elemental creatures with trample. They're still lands.";

export default defineCard({
  name: "Nissa, Worldwaker",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 3,
  text: `${PLUS_ONE}\n${UNTAP}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["trample"],
        duration: "permanent",
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: { kind: "permanent", filter: { subtype: "Forest" } }, max: 4 }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 }, simultaneous: true },
      resolve: null,
      text: UNTAP,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { type: "land", supertype: "basic" },
            destination: "battlefield",
            min: 0,
            max: { librarySize: "you" },
          },
          {
            kind: "animate-all",
            filter: { type: "land", thisWay: "put-onto-battlefield" },
            power: 4,
            toughness: 4,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            keywords: ["trample"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
