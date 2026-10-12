import { defineCard } from "../define.js";

export default defineCard({
  name: "Minotaur Skullcleaver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Berserker"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nWhen this creature enters, it gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, it gets +2/+0 until end of turn.",
    },
  ],
});
