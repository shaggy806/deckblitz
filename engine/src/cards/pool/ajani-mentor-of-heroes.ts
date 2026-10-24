import { defineCard } from "../define.js";

// EDHREC rank 8182.
//
// Rulings:
//   [2014-04-26] If one or more, but not all, of the targets of the first ability are illegal when
//     that ability tries to resolve, no counters will be placed on illegal targets. You can't
//     change the distribution you announced when you activated the ability; the excess counters
//     are just lost.
//   [2014-04-26] You announce how many counters will be placed on each target creature as you
//     activate Ajani's first ability. Each target must receive at least one counter.
// The division is announced with the activation, at least one each (`divided`,
// Ajani, Sleeper Agent's shape).

const DISTRIBUTE_TEXT = "+1: Distribute three +1/+1 counters among one, two, or three target creatures you control.";
const LOOK_TEXT =
  "+1: Look at the top four cards of your library. You may reveal an Aura, creature, or planeswalker card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";
const LIFE_TEXT = "−8: You gain 100 life.";

export default defineCard({
  name: "Ajani, Mentor of Heroes",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 4,
  text: `${DISTRIBUTE_TEXT}\n${LOOK_TEXT}\n${LIFE_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "creature-you-control", min: 1, max: 3 }],
      divided: { total: 3, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: DISTRIBUTE_TEXT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ subtype: "Aura" }, { typesAnyOf: ["creature", "planeswalker"] }] },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 100 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
