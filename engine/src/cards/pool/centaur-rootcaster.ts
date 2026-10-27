import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals combat damage to a player, you may search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Centaur Rootcaster",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Druid"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
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
