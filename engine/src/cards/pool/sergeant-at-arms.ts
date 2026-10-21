import { defineCard } from "../define.js";

// EDHREC rank 26630.
// Makes Soldier → use "Soldier Token".

export default defineCard({
  name: "Sergeant-at-Arms",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  kicker: { cost: "{2}{W}" },
  text: "Kicker {2}{W} (You may pay an additional {2}{W} as you cast this spell.)\nWhen this creature enters, if it was kicked, create two 1/1 white Soldier creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 2 },
      resolve: null,
      text: "When this creature enters, if it was kicked, create two 1/1 white Soldier creature tokens.",
      condition: { kind: "self-kicked" },
    },
  ],
});
