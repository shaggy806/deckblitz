import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 19180.

const ATTACK_TEXT = "Whenever this creature attacks, put a +1/+1 counter on target creature an opponent controls.";

export default defineCard({
  name: "Sunset Saboteur",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\nWard—Discard a card.\n${ATTACK_TEXT}`,
  triggered: [
    ward({ discard: 1 }),
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
