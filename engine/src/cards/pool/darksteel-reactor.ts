import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 3659.
//
// "When this artifact has twenty or more charge counters on it" is a state
// trigger (rule 603.8).

const UPKEEP = "At the beginning of your upkeep, you may put a charge counter on this artifact.";
const WIN = "When this artifact has twenty or more charge counters on it, you win the game.";

export default defineCard({
  name: "Darksteel Reactor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  keywords: ["indestructible"],
  text: `Indestructible (Effects that say "destroy" don't destroy this artifact.)\n${UPKEEP}\n${WIN}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a charge counter on Darksteel Reactor?",
        effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "charge", compare: { op: "gte", n: 20 } } },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: WIN,
    },
  ],
});
