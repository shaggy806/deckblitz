import { defineCard } from "../define.js";

// The `may` is the whole effect, so "do this only once each turn" stops it
// triggering again once it has done it, and a declined one still can (the
// ruling). A simultaneous mill by several players fires once for the total.
const MILL_TEXT =
  "Whenever one or more nonland cards are milled, you may create that many 2/2 black Zombie Mutant creature tokens. Do this only once each turn.";

export default defineCard({
  name: "Screeching Scorchbeast",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat", "Mutant"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "menace"],
  text: `Flying, menace\nWhenever this creature attacks, each player gets two rad counters.\n${MILL_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: 2, who: "each-player" },
      resolve: null,
      text: "Whenever this creature attacks, each player gets two rad counters.",
    },
    {
      trigger: { on: "mills", who: "any", filter: { notTypes: ["land"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create that many 2/2 black Zombie Mutant creature tokens?",
        oncePerTurn: true,
        effect: { kind: "create-token", token: "Zombie Mutant Token", count: { triggerValue: true } },
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
