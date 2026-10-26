import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 22634.
//
// "If its power is 2 or less" is an intervening if (rule 603.4): checked as
// the creature attacks and again as the trigger resolves.
export default defineCard({
  name: "Writ of Passage",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhenever enchanted creature attacks, if its power is 2 or less, it can't be blocked this turn.\nForecast — {1}{U}, Reveal this card from your hand: Target creature with power 2 or less can't be blocked this turn. (Activate only during your upkeep and only once each turn.)",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      condition: { kind: "trigger-object", filter: { power: { op: "lte", n: 2 } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever enchanted creature attacks, if its power is 2 or less, it can't be blocked this turn.",
    },
  ],
  activated: [
    forecast({
      cost: { mana: "{1}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "Forecast — {1}{U}, Reveal this card from your hand: Target creature with power 2 or less can't be blocked this turn. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});
