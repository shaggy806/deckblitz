import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 13875. Slime Molding's X/X token, with
// buyback as a kicker.

export default defineCard({
  name: "Wurmcalling",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{2}{G}", keyword: "buyback" },
  text: "Buyback {2}{G} (You may pay an additional {2}{G} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCreate an X/X green Wurm creature token.",
  targets: [],
  effect: { kind: "create-token", token: "Wurm Token", count: 1, basePt: { power: "x", toughness: "x" } },
});
