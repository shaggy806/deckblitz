import { defineCard } from "../define.js";

// EDHREC rank 26146.
//
// Rulings:
//   [2022-10-14] If a replacement effect causes the milled cards to be exiled instead of going to
//     the graveyard, this effect can still apply to the cards "milled this way" in exile.
//   [2022-10-14] You put a +1/+1 counter on Tomakul Scrapsmith if you don't put an artifact card
//     into your hand with its ability, even if there wasn't an artifact card among the milled
//     cards.
//
// Ravenous Gigamole's shape: the `this-way` condition and the choice both find
// a milled card wherever it went (rule 701.17c), and "if you don't" is the
// `may`'s `else`.

const ETB_TEXT =
  "When this creature enters, mill three cards. You may put an artifact card from among the cards milled this way into your hand. If you don't, put a +1/+1 counter on this creature.";
const COUNTER = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;
const MILLED_ARTIFACT = { thisWay: "milled", type: "artifact" } as const;

export default defineCard({
  name: "Tomakul Scrapsmith",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
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
            condition: { kind: "this-way", what: "milled", filter: { type: "artifact" } },
            then: {
              kind: "may",
              prompt: "Put an artifact card from among the milled cards into your hand?",
              effect: {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 1,
                max: 1,
                destination: "hand",
                leftover: "stay",
                filter: MILLED_ARTIFACT,
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
