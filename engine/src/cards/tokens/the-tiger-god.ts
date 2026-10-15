import { defineCard } from "../define.js";

/**
 * White Tiger, Ava Ayala's token — "The Tiger God, a legendary 4/4 green Cat
 * God creature token with 'The Tiger God can't be blocked by more than one
 * creature.'" A named token whose name collides with no card, so it's keyed
 * by that name (The Void's shape) and the legend rule reads "The Tiger God".
 */
const BLOCK_TEXT = "The Tiger God can't be blocked by more than one creature.";

export default defineCard({
  name: "The Tiger God",
  art: "4d1ca2ed-c987-4f92-ad7b-991d7a64d145",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "God"],
  power: 4,
  toughness: 4,
  text: BLOCK_TEXT,
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: BLOCK_TEXT }],
});
