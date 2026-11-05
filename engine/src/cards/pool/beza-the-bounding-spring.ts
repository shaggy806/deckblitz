import { defineCard } from "../define.js";

// EDHREC rank 4099.
// Makes Treasure → use "Treasure Token".
// Makes Fish → use "Fish Token".

export default defineCard({
  name: "Beza, the Bounding Spring",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Elk"],
  power: 4,
  toughness: 5,
  text: "When Beza enters, create a Treasure token if an opponent controls more lands than you. You gain 4 life if an opponent has more life than you. Create two 1/1 blue Fish creature tokens if an opponent controls more creatures than you. Draw a card if an opponent has more cards in hand than you.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "opponent-controls-more", filter: { type: "land" } },
            then: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
          {
            kind: "conditional",
            condition: { kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" },
            then: { kind: "gain-life", amount: 4 },
          },
          {
            kind: "conditional",
            condition: { kind: "opponent-controls-more", filter: { type: "creature" } },
            then: { kind: "create-token", token: "Fish Token", count: 2 },
          },
          {
            kind: "conditional",
            condition: { kind: "player-compare", stat: "hand", compare: "fewer", than: "an-opponent" },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "When Beza enters, create a Treasure token if an opponent controls more lands than you. You gain 4 life if an opponent has more life than you. Create two 1/1 blue Fish creature tokens if an opponent controls more creatures than you. Draw a card if an opponent has more cards in hand than you.",
    },
  ],
});
