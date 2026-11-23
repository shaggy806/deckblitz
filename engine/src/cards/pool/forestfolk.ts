import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2).

export default defineCard({
  name: "Forestfolk",
  manaCost: "{2}{U}{G}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When Forestfolk enters the battlefield, you may search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\nWhen Forestfolk leaves the battlefield, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: "When Forestfolk enters the battlefield, you may search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When Forestfolk leaves the battlefield, draw a card.",
    },
  ],
});
