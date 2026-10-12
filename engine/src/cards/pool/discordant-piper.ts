import { defineCard } from "../define.js";

export default defineCard({
  name: "Discordant Piper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Satyr"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, create a 0/1 white Goat creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goat Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 0/1 white Goat creature token.",
    },
  ],
});
