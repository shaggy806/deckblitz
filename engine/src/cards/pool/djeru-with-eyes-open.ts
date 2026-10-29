import { defineCard } from "../define.js";

// Ruling: 1 damage from each source to each planeswalker you control is
// prevented — `preventAmount` applies to each damage event (rule 615.10).

export default defineCard({
  name: "Djeru, With Eyes Open",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen Djeru enters, you may search your library for a planeswalker card, reveal it, put it into your hand, then shuffle.\nIf a source would deal damage to a planeswalker you control, prevent 1 of that damage.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a planeswalker card?",
        effect: {
          kind: "search-library",
          filter: { type: "planeswalker" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When Djeru enters, you may search your library for a planeswalker card, reveal it, put it into your hand, then shuffle.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        toFilter: { type: "planeswalker", controlledBy: "you" },
        preventAmount: 1,
      },
      text: "If a source would deal damage to a planeswalker you control, prevent 1 of that damage.",
    },
  ],
});
