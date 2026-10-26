import { defineCard } from "../define.js";

export default defineCard({
  name: "Rune-Tail, Kitsune Ascendant",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Monk"],
  power: 2,
  toughness: 2,
  text: "When you have 30 or more life, flip Rune-Tail.",
  triggered: [
    {
      trigger: { on: "state", state: { kind: "life-total", atLeast: 30 } },
      targets: [],
      effect: { kind: "flip", target: "source" },
      resolve: null,
      text: "When you have 30 or more life, flip Rune-Tail.",
    },
  ],
  faces: ["Rune-Tail, Kitsune Ascendant", "Rune-Tail's Essence"],
  flip: true,
});
