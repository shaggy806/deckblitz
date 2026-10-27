import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 32027.

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {B}.";

export default defineCard({
  name: "Whipstitched Zombie",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{B}", text: "Pay {B}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
