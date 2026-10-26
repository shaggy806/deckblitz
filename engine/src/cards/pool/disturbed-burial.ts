import { defineCard } from "../define.js";

export default defineCard({
  name: "Disturbed Burial",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nReturn target creature card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
