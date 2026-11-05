import { defineCard } from "../define.js";

const FLIP = "At the beginning of the end step, if this creature is enchanted by two or more Auras, flip it.";

export default defineCard({
  name: "Kitsune Mystic",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Wizard"],
  power: 2,
  toughness: 3,
  text: FLIP,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "source", filter: { attachments: { filter: { subtype: "Aura" }, atLeast: 2 } } },
      targets: [],
      effect: { kind: "flip", target: "source" },
      resolve: null,
      text: FLIP,
    },
  ],
  faces: ["Kitsune Mystic", "Autumn-Tail, Kitsune Sage"],
  flip: true,
});
