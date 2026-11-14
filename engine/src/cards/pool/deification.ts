import { defineCard } from "../define.js";
import { PLANESWALKER_TYPES } from "../helpers.js";

// EDHREC rank 9180.
const CHOOSE_TEXT = "As this enchantment enters, choose a planeswalker type.";
const HEXPROOF_TEXT = "Planeswalkers you control of the chosen type have hexproof.";
const LOYALTY_TEXT =
  "As long as you control a creature, if damage dealt to a planeswalker you control of the chosen type would result in all loyalty counters on it being removed, instead all but one of those counters are removed.";
const YOUR_CHOSEN_PLANESWALKERS = {
  scope: "filter",
  filter: { type: "planeswalker", controlledBy: "you", ofChosenType: true },
} as const;

/**
 * Deification. The type is chosen as it enters (rule 614.12), from rule
 * 205.3j's list. The last ability replaces what the damage does to the
 * planeswalker's loyalty (rule 120.3c), never the damage: all of it is dealt,
 * lifelink and all (the ruling). "As long as you control a creature" is read
 * as the damage is dealt, so it still applies to combat damage dealt in the
 * same step that the last creature dies (the ruling: the creature is put into
 * the graveyard by the state-based check after).
 */
export default defineCard({
  name: "Deification",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CHOOSE_TEXT}\n${HEXPROOF_TEXT}\n${LOYALTY_TEXT}`,
  chooseOnEnter: PLANESWALKER_TYPES,
  static: [
    { affects: YOUR_CHOSEN_PLANESWALKERS, grantKeywords: ["hexproof"], text: HEXPROOF_TEXT },
    {
      affects: YOUR_CHOSEN_PLANESWALKERS,
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 1 },
      damageLeavesOneLoyalty: true,
      text: LOYALTY_TEXT,
    },
  ],
});
