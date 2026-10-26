import { defineCard } from "../define.js";

// EDHREC rank 14158.

export default defineCard({
  name: "Seething Anger",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget creature gets +3/+0 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
});
