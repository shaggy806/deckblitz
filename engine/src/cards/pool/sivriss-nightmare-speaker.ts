import { defineCard } from "../define.js";

// Commander Legends: Battle for Baldur's Gate. `repeat` gives each opponent's
// pass its own "this way", so "that card" is the one just milled. A milled card
// a replacement exiled instead (Rest in Peace) isn't in the graveyard to return.

const TEXT =
  "{T}, Sacrifice another creature or an artifact: For each opponent, you mill a card, then return that card from your graveyard to your hand unless that player pays 3 life.";

export default defineCard({
  name: "Sivriss, Nightmare Speaker",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Cleric", "Warlock"],
  power: 3,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: `${TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "repeat",
          times: 1,
          effect: {
            kind: "sequence",
            effects: [
              { kind: "mill", target: "you", amount: 1 },
              {
                kind: "unless",
                chooser: "that-player",
                options: [{ payLife: 3, text: "Pay 3 life" }],
                otherwise: {
                  kind: "look-and-choose",
                  zone: "graveyard",
                  min: 1,
                  max: 1,
                  destination: "hand",
                  leftover: "stay",
                  filter: { thisWay: "milled", inZone: "graveyard" },
                },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
