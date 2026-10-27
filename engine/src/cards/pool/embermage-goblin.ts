import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 28537. Wretched Throng's search, on entering.

const ENTERS_TEXT =
  "When this creature enters, you may search your library for a card named Embermage Goblin, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Embermage Goblin",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n{T}: This creature deals 1 damage to any target.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Embermage Goblin?",
        effect: {
          kind: "search-library",
          filter: { name: "Embermage Goblin" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
