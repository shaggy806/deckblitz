import { defineCard } from "../define.js";

const HIT_TEXT =
  "Whenever this creature deals combat damage to a player, you may search your library for a card named Tempest Hawk, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Tempest Hawk",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${HIT_TEXT}\nA deck can have any number of cards named Tempest Hawk.`,
  deckCopies: "any",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Tempest Hawk?",
        effect: {
          kind: "search-library",
          filter: { name: "Tempest Hawk" },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
});
