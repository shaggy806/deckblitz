import { defineCard } from "../define.js";

// EDHREC rank 5716.
//
// Rulings:
//   [2019-06-14] Serra's emblem doesn't stop loss of life from effects that say that you lose life.
//   [2019-06-14] Serra's emblem doesn't prevent damage. It only changes the result of damage dealt
//     to you.
//   [2019-06-14] Serra's first ability affects only creatures you control with flying at the time
//     it resolves.
//
// The emblem is Worship's static.
const EMBLEM_TEXT =
  "If you control a creature, damage that would reduce your life total to less than 1 reduces it to 1 instead.";

export default defineCard({
  name: "Serra the Benevolent",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Serra"],
  loyalty: 4,
  text: `+2: Creatures you control with flying get +1/+1 until end of turn.\n−3: Create a 4/4 white Angel creature token with flying and vigilance.\n−6: You get an emblem with "${EMBLEM_TEXT}"`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", keyword: "flying" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "+2: Creatures you control with flying get +1/+1 until end of turn.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Vigilant Angel Token", count: 1 },
      resolve: null,
      text: "−3: Create a 4/4 white Angel creature token with flying and vigilance.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: {
          affects: { scope: "self" },
          condition: { kind: "controls", filter: { type: "creature" }, atLeast: 1 },
          damageLifeFloor: 1,
          text: EMBLEM_TEXT,
        },
      },
      resolve: null,
      text: `−6: You get an emblem with "${EMBLEM_TEXT}"`,
    },
  ],
});
