import { defineCard } from "../define.js";

/**
 * Falcon, Winged Wonder's token — "Redwing, a legendary 1/1 blue Bird Scout
 * creature token with flying and 'Whenever Redwing attacks, surveil 1.'" A
 * named token whose name collides with no card, so it's keyed by that name
 * (The Void's shape) and the legend rule reads "Redwing".
 */
const ATTACK_TEXT = "Whenever Redwing attacks, surveil 1.";

export default defineCard({
  name: "Redwing",
  art: "905bbfdf-17c4-4493-a842-3112947d8e13",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
