import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 11169.

export default defineCard({
  name: "Mind Games",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{2}{U}", keyword: "buyback" },
  text: "Buyback {2}{U} (You may pay an additional {2}{U} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTap target artifact, creature, or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: { kind: "tap", target: 0 },
});
