import { defineCard } from "../define.js";

// EDHREC rank 12741.

const TEXT = "Whenever another snow permanent you control enters, you may have target player mill two cards.";

export default defineCard({
  name: "Iceberg Cancrix",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Crab"],
  power: 0,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { supertype: "snow" }, otherOnly: true },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player mill two cards?",
        effect: { kind: "mill", target: 0, amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
