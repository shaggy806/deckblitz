import { defineCard } from "../define.js";

export default defineCard({
  name: "Lay Bare the Heart",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonlegendary, nonland card from it. That player discards that card.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"], notSupertype: "legendary" } },
});
