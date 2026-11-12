import { defineCard } from "../define.js";

// EDHREC rank 13033. "Another player of your choice" is chosen as the ability
// resolves (Discerning Financier's shape), and that player decides whether to
// take the permanent.

const GIFT_TEXT =
  "{3}, {T}: Choose target permanent you control. Draw a card, then another player of your choice may gain control of that permanent. Activate only as a sorcery.";

export default defineCard({
  name: "Stardew Valley",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n{2}, {T}, Tap an untapped creature you control: Create a Food token.\n${GIFT_TEXT}`,
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
        mana: "{2}",
        tap: true,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "{2}, {T}, Tap an untapped creature you control: Create a Food token.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "choose-opponent",
            then: {
              kind: "each-player-may",
              who: "that-player",
              prompt: "Gain control of the permanent?",
              effect: { kind: "gain-control", target: 0, who: "that-player", untilEndOfTurn: false },
            },
          },
        ],
      },
      resolve: null,
      text: GIFT_TEXT,
      sorcerySpeed: true,
    },
  ],
});
