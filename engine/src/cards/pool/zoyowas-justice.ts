import { defineCard } from "../define.js";

// EDHREC rank 5481. X is the target's mana value as it last existed on the
// battlefield; its owner discovers from their own library and makes the
// cast-or-hand choice.

export default defineCard({
  name: "Zoyowa's Justice",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "The owner of target artifact or creature with mana value 1 or greater shuffles it into their library. Then that player discovers X, where X is its mana value. (They exile cards from the top of their library until they exile a nonland card with that mana value or less. They cast it without paying its mana cost or put it into their hand. They put the rest on the bottom in a random order.)",
  targets: [
    {
      kind: "permanent",
      filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "gte", n: 1 } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-into-library", target: 0 },
      { kind: "as-player", who: { ownerOf: 0 }, effect: { kind: "discover", amount: { manaValueOf: 0 } } },
    ],
  },
});
