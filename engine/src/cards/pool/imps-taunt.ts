import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 27540.

export default defineCard({
  name: "Imps' Taunt",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget creature attacks this turn if able.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-attack"] },
});
