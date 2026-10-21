import { defineCard } from "../define.js";

// Core Set 2020. Nightmare Sower's trigger: it must already be on the
// battlefield, so casting it on an opponent's turn doesn't count (ruling).
const CAST_TEXT = "Whenever you cast a spell during an opponent's turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Brineborn Cutthroat",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Pirate"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
