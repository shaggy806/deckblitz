import { defineCard } from "../define.js";

// EDHREC rank 10530.
//
// Rulings:
//   [2017-03-14] If either target of Domri's second ability is an illegal target when the ability
//     tries to resolve, neither creature will deal or be dealt damage.
//   [2017-03-14] The second target of Domri's second ability can be another creature you control,
//     but it can't be the same creature as the first target.
//   [2017-03-14] When resolving Domri's first ability, if the card you look at isn't a creature
//     card, or if it's a creature card you don't want to put into your hand, you simply put it
//     back on top of your library. You don't reveal it or say why you're putting it back.
//   [2024-01-12] If a creature has both double strike and trample, the combat damage it assigned
//     during the first combat damage step will be considered when determining how much damage can
//     trample through in the second combat damage step.

const PLUS_TEXT =
  "+1: Look at the top card of your library. If it's a creature card, you may reveal it and put it into your hand.";
const FIGHT_TEXT = "−2: Target creature you control fights another target creature.";
const EMBLEM_TEXT =
  "−7: You get an emblem with \"Creatures you control have double strike, trample, hexproof, and haste.\"";

export default defineCard({
  name: "Domri Rade",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Domri"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${FIGHT_TEXT}\n${EMBLEM_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: FIGHT_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Creatures you control have double strike, trample, hexproof, and haste.",
        static: {
          affects: { scope: "creatures-you-control" },
          grantKeywords: ["double-strike", "trample", "hexproof", "haste"],
          text: "Creatures you control have double strike, trample, hexproof, and haste.",
        },
      },
      resolve: null,
      text: EMBLEM_TEXT,
    },
  ],
});
