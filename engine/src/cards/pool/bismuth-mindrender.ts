import { defineCard } from "../define.js";

// The card is cast as the trigger resolves or not at all,
// its type's timing ignored; the life is a `cast-now`'s `byPayingLife`, an
// alternative cost, so X is 0 and additional costs may still be paid (the
// rulings). Not cast, it remains in exile.
const COMBAT_TEXT =
  "Whenever this creature deals combat damage to a player, that player exiles cards from the top of their library until they exile a nonland card. You may cast that card by paying life equal to the spell's mana value rather than paying its mana cost.";

export default defineCard({
  name: "Bismuth Mindrender",
  manaCost: "{3}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Devoid (This card has no color.)\nMenace\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        whose: "that-player",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: { kind: "cast-now", target: 0, byPayingLife: true },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
