import { defineCard } from "../define.js";

// EDHREC rank 12644.
//
// Rulings:
//   Cosmos Charger's third ability applies only if it's on the battlefield. Notably, it doesn't
//     affect when you can foretell Cosmos Charger itself or how much you pay to do so.
//   While you control Cosmos Charger, you can foretell cards any time you have priority.
//   The cost reduction refers to the cost you pay as you exile the card from your hand face down,
//     not the cost you pay as you cast the spell from exile.
//   If you control two Cosmos Chargers, you can foretell cards from your hand by paying {0}.
//     Additional Cosmos Chargers won't affect this cost further.
const CHARGER = "Foretelling cards from your hand costs {1} less and can be done on any player's turn.";
const FORETELL =
  "Foretell {2}{U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)";

export default defineCard({
  name: "Cosmos Charger",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horse", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  foretell: { cost: "{2}{U}" },
  text: `Flash\nFlying\n${CHARGER}\n${FORETELL}`,
  static: [{ affects: { scope: "self" }, foretelling: { less: 1, anyTurn: true }, text: CHARGER }],
});
