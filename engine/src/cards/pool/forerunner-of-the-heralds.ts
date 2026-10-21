import { defineCard } from "../define.js";

// EDHREC rank 9569.

export default defineCard({
  name: "Forerunner of the Heralds",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, you may search your library for a Merfolk card, reveal it, then shuffle and put that card on top.\nWhenever another Merfolk you control enters, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Merfolk card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Merfolk" },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a Merfolk card, reveal it, then shuffle and put that card on top.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Merfolk" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another Merfolk you control enters, put a +1/+1 counter on this creature.",
    },
  ],
});
