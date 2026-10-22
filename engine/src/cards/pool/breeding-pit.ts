import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 22385.
//
// Rulings:
//   - Breeding Pit must actually be on the battlefield at the beginning of the end step for you to
//     get a Thrull. The Thrull is not part of paying the upkeep.
const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {B}{B}.";
const THRULL = "At the beginning of your end step, create a 0/1 black Thrull creature token.";

export default defineCard({
  name: "Breeding Pit",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${THRULL}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{B}{B}", text: "Pay {B}{B}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Thrull Token", count: 1 },
      resolve: null,
      text: THRULL,
    },
  ],
});
