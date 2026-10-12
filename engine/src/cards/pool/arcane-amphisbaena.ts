import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcane Amphisbaena",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhen this creature enters, empower Jace 2. (Put two loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 2 },
      resolve: null,
      text: "When this creature enters, empower Jace 2.",
    },
  ],
});
