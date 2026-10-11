import { defineCard } from "../define.js";

// EDHREC rank 6808.
// Makes Treefolk → "Treefolk Token (Sylvan Offering)" (an X/X: its base P/T set as it's made).
//
// Rulings:
//   Assemble the Entmoot's activated ability counts the total amount of life you gained
//     without taking into account any life you lost during that turn. For example, if you
//     gained 3 life and lost 3 life earlier in the turn, you'll create three tapped 3/3 green
//     Treefolk creature tokens, then put a reach counter on each of them.
//
// X is the `life-gained` turn stat (gains only, losses ignored — the ruling),
// read once as the ability resolves. The reach counters go on once the tokens
// have entered (`thenCounters`), a keyword counter (rule 122.1b).

const ANTHEM = "Creatures you control have reach.";
const TREEFOLK =
  "Sacrifice this enchantment: Create three tapped X/X green Treefolk creature tokens, where X is the amount of life you gained this turn. Put a reach counter on each of them.";
const LIFE_GAINED = { turnStat: "life-gained", who: "you" } as const;

export default defineCard({
  name: "Assemble the Entmoot",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ANTHEM}\n${TREEFOLK}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["reach"],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treefolk Token (Sylvan Offering)",
        count: 3,
        tapped: true,
        basePt: { power: LIFE_GAINED, toughness: LIFE_GAINED },
        thenCounters: { kind: "reach", amount: 1 },
      },
      resolve: null,
      text: TREEFOLK,
    },
  ],
});
