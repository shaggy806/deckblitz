import { defineCard } from "../define.js";

export default defineCard({
  name: "Mindseeker Oculus",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, empower Jace 4. (Put four loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 4 },
      resolve: null,
      text: "When this creature enters, empower Jace 4.",
    },
  ],
});
