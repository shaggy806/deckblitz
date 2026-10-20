import { defineCard } from "../define.js";

export default defineCard({
  name: "Pilgrim of the Ages",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, you may search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.\n{6}: Return this card from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "{6}: Return this card from your graveyard to your hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic Plains card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", subtype: "Plains" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
