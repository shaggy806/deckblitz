import { defineCard } from "../define.js";

export default defineCard({
  name: "Elvish Fury",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  kicker: { cost: "{4}", keyword: "buyback" },
  text: "Buyback {4} (You may pay an additional {4} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget creature gets +2/+2 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
});
