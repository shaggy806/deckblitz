import { defineCard } from "../define.js";

export default defineCard({
  name: "Seismic Monstrosaur",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Trample\n{2}{R}, Sacrifice a land: Draw a card.\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}{R}, Sacrifice a land: Draw a card.",
    },
  ],
});
