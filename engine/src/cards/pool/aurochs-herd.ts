import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 30630.

export default defineCard({
  name: "Aurochs Herd",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Aurochs"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, you may search your library for an Aurochs card, reveal it, put it into your hand, then shuffle.\nWhenever this creature attacks, it gets +1/+0 until end of turn for each other attacking Aurochs.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Aurochs card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Aurochs" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for an Aurochs card, reveal it, put it into your hand, then shuffle.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", subtype: "Aurochs", attacking: true }, excludeSelf: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature attacks, it gets +1/+0 until end of turn for each other attacking Aurochs.",
    },
  ],
});
