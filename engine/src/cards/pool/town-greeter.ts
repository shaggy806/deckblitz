import { defineCard } from "../define.js";

// EDHREC rank 7706.
//
// The milled land card is chosen with a look-and-choose over the milled cards
// (Something Worth Saving's shape); its `then` sees the card taken as target 0,
// so "if you put a Town card into your hand this way" reads that card, and with
// nothing taken the `then` doesn't run at all.

const ETB_TEXT =
  "When this creature enters, mill four cards. You may put a land card from among them into your hand. If you put a Town card into your hand this way, you gain 2 life.";

export default defineCard({
  name: "Town Greeter",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT} (To mill four cards, a player puts the top four cards of their library into their graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "land" },
            then: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { subtype: "Town" } },
              then: { kind: "gain-life", amount: 2 },
            },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
