import { defineCard } from "../define.js";

// Rulings:
//   [2023-02-04] A player with ten or more poison counters loses the game. This is a state-based
//     action and doesn't use the stack. In other words, it happens immediately and players can't
//     respond to it, just like a player losing the game due to having 0 or less life.
//   [2023-02-04] Toxic doesn't change the amount of combat damage a creature deals. For example,
//     if a 2/2 creature with toxic 1 deals combat damage to a player, that creature will deal 2
//     damage. The results of that damage are the player loses 2 life and gets a poison counter.
//   [2023-02-04] Any other effects of that damage, such as life gain from lifelink, still apply.
//   [2023-02-04] Multiple instances of toxic are cumulative.

const UPKEEP_TEXT =
  'At the beginning of your upkeep, you lose 1 life and create a 1/1 colorless Phyrexian Mite artifact creature token with toxic 1 and "This token can\'t block."';
const CORRUPTED_TEXT =
  "Corrupted — As long as an opponent has three or more poison counters, creatures you control with toxic have lifelink.";

export default defineCard({
  name: "Skrelv's Hive",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${CORRUPTED_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1 },
          { kind: "create-token", token: "Phyrexian Mite Token", count: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      // Toxic granted in layer 6 counts as well as printed (rule 613.8).
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", hasToxic: true } },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      grantKeywords: ["lifelink"],
      text: CORRUPTED_TEXT,
    },
  ],
});
