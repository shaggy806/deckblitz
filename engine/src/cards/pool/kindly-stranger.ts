import { defineCard } from "../define.js";

const TEXT =
  "Delirium — {2}{B}: Transform this creature. Activate only if there are four or more card types among cards in your graveyard.";

// Raving Visionary's activation gate: checked as it's activated, not again
// as it resolves (the ruling).
export default defineCard({
  name: "Kindly Stranger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Kindly Stranger", "Demon-Possessed Witch"],
  transform: true,
});
