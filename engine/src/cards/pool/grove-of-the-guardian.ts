import { defineCard } from "../define.js";

// EDHREC rank 9796.
//
// Rulings:
//   [2012-10-01] To activate Grove of the Guardian's second ability you can tap any two untapped
//     creatures you control, including ones you haven't controlled continuously since the
//     beginning of your most recent turn.
//   [2012-10-01] You can't tap Grove of the Guardian to activate both abilities at the same time.

export default defineCard({
  name: "Grove of the Guardian",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{3}{G}{W}, {T}, Tap two untapped creatures you control, Sacrifice this land: Create an 8/8 green and white Elemental creature token with vigilance.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: {
        mana: "{3}{G}{W}",
        tap: true,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" } },
        sacrifice: "self",
      },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Token 8/8 (Vigilance)", count: 1 },
      resolve: null,
      text: "{3}{G}{W}, {T}, Tap two untapped creatures you control, Sacrifice this land: Create an 8/8 green and white Elemental creature token with vigilance.",
    },
  ],
});
