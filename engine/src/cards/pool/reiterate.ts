import { defineCard } from "../define.js";

export default defineCard({
  name: "Reiterate",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCopy target instant or sorcery spell. You may choose new targets for the copy.",
  targets: ["instant-or-sorcery-spell"],
  effect: { kind: "copy-spell", target: 0, newTargets: true },
});
