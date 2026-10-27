import { defineCard } from "../define.js";

// EDHREC rank 28235. The threshold line grants the creature a second upkeep
// trigger while threshold holds (a static granting a triggered ability, not an
// intervening "if"): it triggers only with seven or more cards in the
// graveyard as the upkeep begins, and then resolves whatever happens to the
// graveyard meanwhile.

const FIRST_TEXT = "At the beginning of your upkeep, you may put a +1/+1 counter on this creature.";
const GRANTED_TEXT = "At the beginning of your upkeep, you may put another +1/+1 counter on this creature.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Chlorophant",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: `${FIRST_TEXT}\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Chlorophant?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: FIRST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Put another +1/+1 counter on Chlorophant?",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
