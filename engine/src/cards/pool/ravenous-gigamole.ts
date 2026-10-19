import { defineCard } from "../define.js";

// EDHREC rank 23301.
//
// Rulings:
//   [2022-10-14] You put a +1/+1 counter on Ravenous Gigamole if you don't put a creature card
//     into your hand with its ability, even if there wasn't a creature card among the milled
//     cards.
//   [2022-10-14] If a replacement effect causes the milled cards to be exiled rather than go to
//     the graveyard, this effect can still apply to the cards "milled this way" in exile.
//
// Ainok Wayfarer's shape, with Patient Naturalist's `this-way` condition so a
// milled card a replacement exiled still counts (the second ruling): the
// choice finds it wherever it went too (rule 701.17c). "If you don't" is the
// `may`'s `else`, and with no milled creature card you don't.

const ETB_TEXT =
  "When this creature enters, mill three cards. You may put a creature card from among the cards milled this way into your hand. If you don't, put a +1/+1 counter on this creature.";
const COUNTER = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;
const MILLED_CREATURE = { thisWay: "milled", type: "creature" } as const;

export default defineCard({
  name: "Ravenous Gigamole",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Mole", "Horror"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { type: "creature" } },
            then: {
              kind: "may",
              prompt: "Put a creature card from among the milled cards into your hand?",
              effect: {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 1,
                max: 1,
                destination: "hand",
                leftover: "stay",
                filter: MILLED_CREATURE,
              },
              else: COUNTER,
            },
            else: COUNTER,
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
