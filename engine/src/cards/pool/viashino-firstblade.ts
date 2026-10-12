import { defineCard } from "../define.js";

export default defineCard({
  name: "Viashino Firstblade",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nWhen this creature enters, it gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, it gets +2/+2 until end of turn.",
    },
  ],
});
