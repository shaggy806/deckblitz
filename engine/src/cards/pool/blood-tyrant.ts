import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, each player loses 1 life. Put a +1/+1 counter on this creature for each 1 life lost this way.";
const LOSES_TEXT = "Whenever a player loses the game, put five +1/+1 counters on this creature.";

// The generic `loses-game` trigger (B278): however the player lost (its
// ruling), matched as they lose, before they leave (rule 800.4a).
export default defineCard({
  name: "Blood Tyrant",
  manaCost: "{4}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${UPKEEP_TEXT}\n${LOSES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-player" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { lifeLostThisWay: true } },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "event", event: "loses-game", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 5 },
      resolve: null,
      text: LOSES_TEXT,
    },
  ],
});
