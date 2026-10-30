import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, you draw X cards and you lose X life, where X is the number of creature cards in target player's graveyard.";

// X is counted once per step as it resolves: drawing comes first and changes
// no graveyard, so both steps read the same number. A target player gone
// illegal counts 0.
const X = { countInGraveyard: { type: "creature", ownedBy: "you" }, forTarget: 0 } as const;

export default defineCard({
  name: "Corpse Augur",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 4,
  toughness: 2,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: X },
          { kind: "lose-life", amount: X, who: "you" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
