import { defineCard } from "../define.js";

// The Treasure comes even if the target isn't destroyed, so long as it's
// still legal (the ruling); "becomes 1" is a real loss of the difference.

const PLUS_TEXT = "+2: Create a 2/2 black Pirate creature token with menace.";
const MINUS_THREE_TEXT =
  "−3: Destroy target artifact, creature, or enchantment. Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")";
const MINUS_TEN_TEXT = "−10: Target player's life total becomes 1.";

export default defineCard({
  name: "Vraska, Relic Seeker",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vraska"],
  loyalty: 6,
  text: `${PLUS_TEXT}\n${MINUS_THREE_TEXT}\n${MINUS_TEN_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Pirate Token", count: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "set-life-total", who: 0, amount: 1 },
      resolve: null,
      text: MINUS_TEN_TEXT,
    },
  ],
});
