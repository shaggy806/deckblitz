import { defineCard } from "../define.js";

export default defineCard({
  name: "Dragon Trainer",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create a 4/4 red Dragon creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 4/4 red Dragon creature token with flying.",
    },
  ],
});
