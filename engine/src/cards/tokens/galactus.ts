import { defineCard } from "../define.js";

/**
 * The Coming of Galactus's token — "Galactus, a legendary 16/16 black Elder
 * Alien creature token with flying, trample, and 'Whenever Galactus attacks,
 * destroy target land.'" A named token whose name collides with no card, so
 * it's keyed by that name (Doombot's shape).
 */
const ATTACK_TEXT = "Whenever Galactus attacks, destroy target land.";

export default defineCard({
  name: "Galactus",
  art: "d911f8c6-88a5-4f66-a400-4df72b49c351",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Alien"],
  power: 16,
  toughness: 16,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
