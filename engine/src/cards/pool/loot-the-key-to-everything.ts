import type { EffectAmount } from "../../effects.js";
import { defineCard, type CardType } from "../define.js";

// EDHREC rank 11525.
//
// X is "the number of card types among other nonland permanents you
// control", counted as the trigger resolves (the ruling): one for each card
// type a nonland permanent can have (artifact, battle, creature, enchantment,
// kindred, planeswalker — the ruling's list) that some other permanent you
// control has. A land is left out whatever else it is (an artifact land
// doesn't count artifact — the ruling), and `excludeSelf` leaves Loot out
// (the rest of a token stack still counts, being other permanents).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile the top X cards of your library, where X is the number of card types among other nonland permanents you control. You may play those cards this turn.";

const NONLAND_TYPES: readonly CardType[] = ["artifact", "battle", "creature", "enchantment", "kindred", "planeswalker"];
const CARD_TYPES_AMONG_OTHERS: EffectAmount = {
  sum: NONLAND_TYPES.map(
    (type): EffectAmount => ({
      ifCondition: { kind: "controls", filter: { type, notTypes: ["land"] }, atLeast: 1, excludeSelf: true },
      then: 1,
      else: 0,
    }),
  ),
};

export default defineCard({
  name: "Loot, the Key to Everything",
  manaCost: "{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast", "Noble"],
  power: 1,
  toughness: 2,
  text: `Ward {1}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: "Ward {1}",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: CARD_TYPES_AMONG_OTHERS, duration: "end-of-turn" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
