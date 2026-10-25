import { defineCard } from "../define.js";

const ETB_TEXT =
  'When this creature enters, create three 1/1 colorless Eldrazi Scion creature tokens. They have "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Brood Monitor",
  manaCost: "{4}{G}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 3 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
