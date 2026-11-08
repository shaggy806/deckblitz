import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, this creature phases out unless you pay {2}{G}{U}.";
const PHASES_IN_TEXT = "Whenever this creature phases in, put a +1/+1 counter on it.";

// The generic `phases-in` trigger (B278); Vaporous Djinn's upkeep.
export default defineCard({
  name: "Warping Wurm",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 1,
  toughness: 1,
  keywords: ["phasing"],
  text: `Phasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)\n${UPKEEP_TEXT}\n${PHASES_IN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}{G}{U}", text: "Pay {2}{G}{U}." }],
        otherwise: { kind: "phase-out", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "event", event: "phases-in", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: PHASES_IN_TEXT,
    },
  ],
});
