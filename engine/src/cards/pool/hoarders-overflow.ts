import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.

const STASH_TEXT = "When this enchantment enters and whenever you expend 4, put a stash counter on it.";
const SAC_TEXT =
  "{1}{R}, Sacrifice this enchantment: Discard your hand, then draw cards equal to the number of stash counters on this enchantment.";

export default defineCard({
  name: "Hoarder's Overflow",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${STASH_TEXT} (You expend 4 as you spend your fourth total mana to cast spells during a turn.)\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "stash", amount: 1 },
      resolve: null,
      text: STASH_TEXT,
    },
    {
      trigger: { on: "expend", who: "you", amount: 4 },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "stash", amount: 1 },
      resolve: null,
      text: STASH_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "self" },
      targets: [],
      // Counted as it last existed, sacrificed to pay the cost.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: { countersOn: "source", counter: "stash" } },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
