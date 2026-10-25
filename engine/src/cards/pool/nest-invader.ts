import { defineCard } from "../define.js";

// EDHREC rank 11944.

const TEXT =
  'When this creature enters, create a 0/1 colorless Eldrazi Spawn creature token. It has "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Nest Invader",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
