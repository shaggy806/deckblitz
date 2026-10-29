import { defineCard } from "../define.js";

export default defineCard({
  name: "Ignoble Soldier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 1,
  text: "Whenever this creature becomes blocked, prevent all combat damage that would be dealt by it this turn.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "damage-rule", by: { target: "source" }, combat: true },
      resolve: null,
      text: "Whenever this creature becomes blocked, prevent all combat damage that would be dealt by it this turn.",
    },
  ],
});
