import { defineCard } from "../define.js";

// EDHREC rank 11081.
//
// Rulings:
//   [2024-07-26] Flamecache Gecko’s first ability isn’t a mana ability. It uses the stack and can
//     be responded to.
//   [2024-07-26] Flamecache Gecko’s ability cares whether an opponent lost life this turn, not how
//     their life total changed. For example, an opponent who gained 2 life and lost 1 life in the
//     same turn still lost life.
//
// The enters trigger is an ordinary triggered ability (Mardu Warshrieker's
// shape), so it uses the stack; "if an opponent lost life this turn" is its
// intervening if (rule 603.4), read off the `life-lost` turn stat.

const ENTER_TEXT = "When this creature enters, if an opponent lost life this turn, add {B}{R}.";
const LOOT_TEXT = "{1}{R}, Discard a card: Draw a card.";

export default defineCard({
  name: "Flamecache Gecko",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warlock"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LOOT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
