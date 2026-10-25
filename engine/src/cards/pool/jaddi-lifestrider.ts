import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 26399.

const TEXT =
  "When this creature enters, you may tap any number of untapped creatures you control. You gain 2 life for each creature tapped this way.";
const UNTAPPED_CREATURE: CardFilter = { type: "creature", controlledBy: "you", tapped: false };

export default defineCard({
  name: "Jaddi Lifestrider",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 8,
  text: TEXT,
  triggered: [
    {
      // The creatures are chosen as it resolves; Jaddi itself may be one (the ruling).
      trigger: { on: "enters-battlefield", who: "self" },
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
          { kind: "gain-life", amount: { product: [{ thisWay: "tapped" }, 2] } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
