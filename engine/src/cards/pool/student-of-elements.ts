import { defineCard } from "../define.js";

export default defineCard({
  name: "Student of Elements",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "When this creature has flying, flip it.",
  triggered: [
    {
      trigger: { on: "state", state: { kind: "source", filter: { keyword: "flying" } } },
      targets: [],
      effect: { kind: "flip", target: "source" },
      resolve: null,
      text: "When this creature has flying, flip it.",
    },
  ],
  faces: ["Student of Elements", "Tobita, Master of Winds"],
  flip: true,
});
