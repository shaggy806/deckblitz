import { defineCard } from "../define.js";

// EDHREC rank 7782.

const TEXT =
  'When this creature enters, create three 0/1 colorless Eldrazi Spawn creature tokens. They have "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Emrakul's Hatcher",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
