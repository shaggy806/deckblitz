import { defineCard } from "../define.js";

// Rulings: the trigger fires once each surveil, even with an empty library;
// the token copies this creature's copiable values only (no counters, no
// tapped state), as it last existed if it has left the battlefield.

const TEXT = "Whenever you surveil, you may pay {1}{U}. If you do, create a token that's a copy of this creature.";

export default defineCard({
  name: "Copy Catchers",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "surveils", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U} to create a token that's a copy of Copy Catchers?",
        cost: "{1}{U}",
        effect: { kind: "create-token-copy", of: "source", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
