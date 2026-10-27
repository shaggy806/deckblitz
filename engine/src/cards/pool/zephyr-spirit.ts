import { defineCard } from "../define.js";

// EDHREC rank 30863. Ravnica: City of Guilds.

const TEXT = "When this creature blocks, return it to its owner's hand.";

export default defineCard({
  name: "Zephyr Spirit",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
