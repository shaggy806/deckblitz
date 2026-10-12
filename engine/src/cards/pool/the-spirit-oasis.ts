import { defineCard } from "../define.js";

// EDHREC rank 7239.

export default defineCard({
  name: "The Spirit Oasis",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Shrine"],
  text: "When The Spirit Oasis enters, draw a card for each Shrine you control.\nWhenever another Shrine you control enters, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Counted as it resolves, The Spirit Oasis itself included.
      effect: { kind: "draw", amount: { countOf: { subtype: "Shrine", controlledBy: "you" } } },
      resolve: null,
      text: "When The Spirit Oasis enters, draw a card for each Shrine you control.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Shrine" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever another Shrine you control enters, draw a card.",
    },
  ],
});
