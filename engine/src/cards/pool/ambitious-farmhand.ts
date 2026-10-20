import { defineCard } from "../define.js";

// EDHREC rank 11171.

export default defineCard({
  name: "Ambitious Farmhand",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, you may search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.\nCoven — {1}{W}{W}: Transform this creature. Activate only if you control three or more creatures with different powers.",
  activated: [
    {
      cost: { mana: "{1}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "Coven — {1}{W}{W}: Transform this creature. Activate only if you control three or more creatures with different powers.",
      condition: { kind: "coven" },
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
  faces: ["Ambitious Farmhand", "Seasoned Cathar"],
  transform: true,
});
