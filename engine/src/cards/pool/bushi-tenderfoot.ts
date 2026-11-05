import { defineCard } from "../define.js";

const FLIP_TEXT = "When a creature dealt damage by this creature this turn dies, flip this creature.";

export default defineCard({
  name: "Bushi Tenderfoot",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: FLIP_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: { kind: "flip", target: "source" },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Bushi Tenderfoot", "Kenzo the Hardhearted"],
  flip: true,
});
