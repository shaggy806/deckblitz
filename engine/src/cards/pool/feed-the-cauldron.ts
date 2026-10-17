import { defineCard } from "../define.js";

// EDHREC rank 14656.
//
// "If it's your turn" is asked as the spell resolves (rule 608.2c); the Food
// comes whether or not the creature was destroyed, so long as the spell
// resolves at all.

export default defineCard({
  name: "Feed the Cauldron",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature with mana value 3 or less. If it's your turn, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "your-turn" },
        then: { kind: "create-token", token: "Food Token", count: 1 },
      },
    ],
  },
});
