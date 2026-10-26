import { defineCard } from "../define.js";

export default defineCard({
  name: "Azorius Arrester",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, detain target creature an opponent controls. (Until your next turn, that creature can't attack or block and its activated abilities can't be activated.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "detain", target: 0 },
      resolve: null,
      text: "When this creature enters, detain target creature an opponent controls.",
    },
  ],
});
