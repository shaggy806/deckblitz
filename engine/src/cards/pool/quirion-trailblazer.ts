import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 22765. Simulacrum Shaper's trigger.

const TEXT =
  "When this creature enters, you may search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Quirion Trailblazer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 1,
  toughness: 2,
  text: TEXT,
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
      text: TEXT,
    },
  ],
});
