import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature and at least two other creatures attack, create a 1/1 white Soldier creature token with lifelink.";

export default defineCard({
  name: "Haazda Marshal",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Soldier Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
