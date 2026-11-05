import { defineCard } from "../define.js";

// EDHREC rank 5552.
//
// Rulings:
//   [2004-10-04] The creature put onto the battlefield by Chainer's activated ability is black
//     only, not black in addition to its other colors. It is, however, a Nightmare in addition to
//     its other creature types. As it enters the battlefield, it is already a black Nightmare
//     (and perhaps some other creature types); it doesn't enter and then become a black
//     Nightmare.
//
// "Is black" sets its colours as it enters (`enterAs.setColors`, rule
// 614.12); "a Nightmare in addition" adds the subtype. "All Nightmares" are
// every player's.
const LORD_TEXT = "All Nightmares get +1/+1.";
const REANIMATE_TEXT =
  "{B}{B}{B}, Pay 3 life: Put target creature card from a graveyard onto the battlefield under your control. That creature is black and is a Nightmare in addition to its other creature types.";
const LEAVE_TEXT = "When Chainer leaves the battlefield, exile all Nightmares.";

export default defineCard({
  name: "Chainer, Dementia Master",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 3,
  toughness: 3,
  text: `${LORD_TEXT}\n${REANIMATE_TEXT}\n${LEAVE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Nightmare" } },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{B}{B}", tap: false, payLife: 3 },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        underYourControl: true,
        enterAs: { setColors: ["B"], addSubtypes: ["Nightmare"] },
      },
      resolve: null,
      text: REANIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { subtype: "Nightmare" } },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
