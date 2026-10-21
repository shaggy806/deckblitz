import { defineCard } from "../define.js";

// EDHREC rank 8231. Burst Lightning's kicker shape: the kicked spell's whole
// effect, four Saprolings in place of two.

export default defineCard({
  name: "Saproling Migration",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Kicker {4} (You may pay an additional {4} as you cast this spell.)\nCreate two 1/1 green Saproling creature tokens. If this spell was kicked, create four of those tokens instead.",
  targets: [],
  effect: { kind: "create-token", token: "Saproling Token", count: 2 },
  kicker: { cost: "{4}", effect: { kind: "create-token", token: "Saproling Token", count: 4 } },
});
