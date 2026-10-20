import { defineCard } from "../define.js";

// EDHREC rank 21779.
//
// Rulings:
//   The cards are exiled face up. Playing them follows the normal rules: costs, timing, and
//   land drops. Any you don't play this turn stay exiled. You may play them even if Ardent
//   Dustspeaker leaves the battlefield or another player gains control of it.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may put an instant or sorcery card from your graveyard on the bottom of your library. If you do, exile the top two cards of your library. You may play those cards this turn.";

export default defineCard({
  name: "Ardent Dustspeaker",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 3,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // The card isn't targeted: it's chosen on resolution. With none to put
      // there's nothing to do; with one, saying yes always puts one ("if you
      // do"), so the exile follows inside the same `may`.
      effect: {
        kind: "conditional",
        condition: {
          kind: "cards-in-graveyard",
          atLeast: 1,
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
        then: {
          kind: "may",
          prompt: "Put an instant or sorcery card from your graveyard on the bottom of your library?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 1,
                max: 1,
                filter: { typesAnyOf: ["instant", "sorcery"] },
                destination: "library-bottom",
                leftover: "stay",
              },
              { kind: "impulse-exile", amount: 2, duration: "end-of-turn" },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
