import { defineCard } from "../define.js";

export default defineCard({
  name: "Conqueror's Foothold",
  art: "https://cards.scryfall.io/art_crop/back/0/2/02bb4b2a-3c9f-48ab-b2a5-ae31f06b82d9.jpg",
  colors: [],
  types: ["land"],
  text: "(Transforms from Conqueror's Galleon.)\n{T}: Add {C}.\n{2}, {T}: Draw a card, then discard a card.\n{4}, {T}: Draw a card.\n{6}, {T}: Return target card from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{2}, {T}: Draw a card, then discard a card.",
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{4}, {T}: Draw a card.",
    },
    {
      cost: { mana: "{6}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you" }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "{6}, {T}: Return target card from your graveyard to your hand.",
    },
  ],
  faces: ["Conqueror's Galleon", "Conqueror's Foothold"],
  transform: true,
});
