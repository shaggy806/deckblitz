import { defineCard } from "../define.js";

// A 1/1 green Boar with "When this token dies, create a Food token." —
// Wolf's Quarry's token.

export default defineCard({
  name: "Boar Token (Wolf's Quarry)",
  art: "365b2234-c29d-42db-a8e0-80685a4b6434",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 1,
  toughness: 1,
  text: "When this token dies, create a Food token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When this token dies, create a Food token.",
    },
  ],
});
