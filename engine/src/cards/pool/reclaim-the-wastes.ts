import { defineCard } from "../define.js";

const search = (max: number) =>
  ({
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "hand",
    min: 0,
    max,
    reveal: true,
  }) as const;

export default defineCard({
  name: "Reclaim the Wastes",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Kicker {3} (You may pay an additional {3} as you cast this spell.)\nSearch your library for a basic land card, reveal it, put it into your hand, then shuffle. If this spell was kicked, search your library for two basic land cards instead of one.",
  targets: [],
  effect: search(1),
  kicker: { cost: "{3}", effect: search(2) },
});
