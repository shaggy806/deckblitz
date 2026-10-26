import { defineCard } from "../define.js";

// EDHREC rank 14102.
//
// Rulings:
//   [2022-12-08] If Gamekeeper is no longer in your graveyard as its triggered ability resolves,
//     you can't choose to exile it. You won't reveal cards from your library.
//
// The Rectors' shape: the exile is the "you may", and the reveal happens only
// if the card was exiled this way — so a Gamekeeper gone from the graveyard
// reveals nothing. With no creature card in the library, every revealed card
// goes to the graveyard (the `reveal-until` miss).
const TEXT =
  "When this creature dies, you may exile it. If you do, reveal cards from the top of your library until you reveal a creature card. Put that card onto the battlefield and put all other cards revealed this way into your graveyard.";

export default defineCard({
  name: "Gamekeeper",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Gamekeeper to reveal cards from the top of your library until you reveal a creature card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: { kind: "reveal-until", filter: { type: "creature" }, put: "battlefield", rest: "graveyard" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
