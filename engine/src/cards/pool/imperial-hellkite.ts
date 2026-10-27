import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 19027.
//
// Rulings:
//   You do not have to find a Dragon card if you do not want to, even if you have one in your
//     library.
//   The trigger occurs when you use the Morph ability to turn the card face up, or when an
//     effect turns it face up. It will not trigger on being revealed or on leaving the battlefield.

export default defineCard({
  name: "Imperial Hellkite",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{6}{R}{R}" },
  text: "Flying\nMorph {6}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, you may search your library for a Dragon card, reveal it, put it into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Dragon card?",
        effect: { kind: "search-library", filter: { subtype: "Dragon" }, destination: "hand", min: 0, max: 1, reveal: true },
      },
      resolve: null,
      text: "When this creature is turned face up, you may search your library for a Dragon card, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
