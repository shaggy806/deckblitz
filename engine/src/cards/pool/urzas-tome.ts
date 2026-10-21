import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 22681.
//
// Rulings:
//   [2018-04-27] You don't choose whether to discard or exile a card from your graveyard until
//     after you see the card you draw.
//   [2018-04-27] You can choose to discard a card even if there's a historic card in your
//     graveyard you could exile.
//
// Kaito Shizuki's "then discard a card unless …", with the "unless" the
// controller's own choice (a `may` whose `else` is the discard). It's offered
// only while there's a historic card to exile, so saying yes always exiles one.

const HISTORIC: CardFilter = { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] };
const TEXT = "{3}, {T}: Draw a card. Then discard a card unless you exile a historic card from your graveyard.";
const DISCARD = { kind: "discard", target: "you", amount: 1 } as const;

export default defineCard({
  name: "Urza's Tome",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${TEXT} (Artifacts, legendaries, and Sagas are historic.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 1, filter: HISTORIC },
            then: {
              kind: "may",
              prompt: "Exile a historic card from your graveyard? (If you don't, discard a card.)",
              effect: {
                kind: "look-and-choose",
                zone: "graveyard",
                filter: HISTORIC,
                min: 1,
                max: 1,
                destination: "exile",
                leftover: "stay",
              },
              else: DISCARD,
            },
            else: DISCARD,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
