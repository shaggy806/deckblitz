import { defineCard } from "../define.js";

// EDHREC rank 19893.
//
// The −7 grants a static, fixed on the creatures you control as it resolves
// (the ruling: ones you begin to control later don't gain it), rather than
// `assign-as-though-unblocked`'s rule for the turn, which would reach them.

const UNBLOCKED_TEXT = "You may have this creature assign its combat damage as though it weren't blocked.";

export default defineCard({
  name: "Garruk, Savage Herald",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  loyalty: 5,
  text: `+1: Reveal the top card of your library. If it's a creature card, put it into your hand. Otherwise, put it on the bottom of your library.\n−2: Target creature you control deals damage equal to its power to another target creature.\n−7: Until end of turn, creatures you control gain "${UNBLOCKED_TEXT}"`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "+1: Reveal the top card of your library. If it's a creature card, put it into your hand. Otherwise, put it on the bottom of your library.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
      effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      resolve: null,
      text: "−2: Target creature you control deals damage equal to its power to another target creature.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "grant-static",
        filter: { type: "creature", controlledBy: "you" },
        ability: { affects: { scope: "self" }, assignAsThoughUnblocked: true, text: UNBLOCKED_TEXT },
        duration: "end-of-turn",
      },
      resolve: null,
      text: `−7: Until end of turn, creatures you control gain "${UNBLOCKED_TEXT}"`,
    },
  ],
});
