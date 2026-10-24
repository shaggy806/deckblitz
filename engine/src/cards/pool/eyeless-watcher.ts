import { defineCard } from "../define.js";

// EDHREC rank 10303. Devoid: no colors.

const TEXT =
  'When this creature enters, create two 1/1 colorless Eldrazi Scion creature tokens. They have "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Eyeless Watcher",
  manaCost: "{3}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 1,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
