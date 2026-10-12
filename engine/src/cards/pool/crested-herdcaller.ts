import { defineCard } from "../define.js";

export default defineCard({
  name: "Crested Herdcaller",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, create a 3/3 green Dinosaur creature token with trample.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 3/3 green Dinosaur creature token with trample.",
    },
  ],
});
