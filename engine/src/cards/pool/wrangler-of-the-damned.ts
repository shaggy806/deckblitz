import { defineCard } from "../define.js";

// EDHREC rank 23907. The intervening "if" (rule 603.4, the ruling): no spell
// cast from your hand this turn, asked as the end step begins and again as
// it resolves.
const END_TEXT =
  "At the beginning of your end step, if you haven't cast a spell from your hand this turn, create a 2/2 white Spirit creature token with flying.";

export default defineCard({
  name: "Wrangler of the Damned",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "cast-this-turn", filter: { castFrom: "hand" }, atLeast: 0, atMost: 0 },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Phantom Interference)", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
