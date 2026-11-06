import { defineCard } from "../define.js";

// EDHREC rank 32562.
//
// "Pay {1} and exile a card from your graveyard" is one optional cost: not
// offered with an empty graveyard (Young Necromancer's gate), the {1} paid by
// the `may`, the card chosen as part of the same choice.

const ETB_TEXT = "When Sylvia Tilly enters, surveil 2.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may pay {1} and exile a card from your graveyard. When you do, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Sylvia Tilly, Joy of Discovery",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Artificer"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Pay {1} and exile a card from your graveyard to put a +1/+1 counter on target creature?",
          cost: "{1}",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "look-and-choose", zone: "graveyard", min: 1, max: 1, destination: "exile", leftover: "stay" },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "exiled" },
                then: {
                  kind: "reflexive-trigger",
                  targets: ["creature"],
                  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                  text: "Put a +1/+1 counter on target creature.",
                },
              },
            ],
          },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
