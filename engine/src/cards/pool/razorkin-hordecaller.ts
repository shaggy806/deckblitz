import { defineCard } from "../define.js";

// EDHREC rank 16858.
// Makes Gremlin → use "Gremlin Token".

export default defineCard({
  name: "Razorkin Hordecaller",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Clown", "Berserker"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste\nWhenever you attack, create a 1/1 red Gremlin creature token.",
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Gremlin Token", count: 1 },
      resolve: null,
      text: "Whenever you attack, create a 1/1 red Gremlin creature token.",
    },
  ],
});
