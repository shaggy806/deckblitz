import { defineCard } from "../define.js";

export default defineCard({
  name: "Hungry Spriggan",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nWhenever this creature attacks, it gets +3/+3 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +3/+3 until end of turn.",
    },
  ],
});
