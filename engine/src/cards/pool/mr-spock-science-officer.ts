import { defineCard } from "../define.js";

// EDHREC rank 22716.

export default defineCard({
  name: "Mr. Spock, Science Officer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Human", "Scientist"],
  power: 2,
  toughness: 4,
  text: "If you would draw a card, draw two cards instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-draw", who: "you", instead: { draws: 2 } },
      text: "If you would draw a card, draw two cards instead.",
    },
  ],
});
