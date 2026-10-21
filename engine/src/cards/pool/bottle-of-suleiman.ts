import { defineCard } from "../define.js";

// EDHREC rank 23725.
//
// Rulings:
//   [2004-10-04] The coin is flipped on resolution and not on declaration of the ability.

const TEXT =
  "{1}, Sacrifice this artifact: Flip a coin. If you win the flip, create a 5/5 colorless Djinn artifact creature token with flying. If you lose the flip, this artifact deals 5 damage to you.";

export default defineCard({
  name: "Bottle of Suleiman",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: { kind: "create-token", token: "5/5 Djinn Artifact Token", count: 1 },
        lost: { kind: "damage", amount: 5, who: "you" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
