import { defineCard } from "../define.js";

// EDHREC rank 17537.

const TEXT =
  'When this creature enters, create two 0/1 colorless Eldrazi Spawn creature tokens. They have "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Dread Drone",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 4,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
