import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 22677.
const TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";

export default defineCard({
  name: "Sage of Shaila's Claim",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
