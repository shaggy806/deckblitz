import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// Portal. EDHREC rank 24938. Jaddi Lifestrider's shape, chosen as it resolves.
const UNTAPPED_CREATURE: CardFilter = { type: "creature", controlledBy: "you", tapped: false };

export default defineCard({
  name: "Harmony of Nature",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Tap any number of untapped creatures you control. You gain 4 life for each creature tapped this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: UNTAPPED_CREATURE,
        min: 0,
        upTo: { countOf: UNTAPPED_CREATURE },
        then: { kind: "tap", target: 0 },
        prompt: "Tap any number of untapped creatures you control",
      },
      { kind: "gain-life", amount: { product: [{ thisWay: "tapped" }, 4] } },
    ],
  },
});
