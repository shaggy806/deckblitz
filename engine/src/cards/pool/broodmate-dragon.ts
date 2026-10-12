import { defineCard } from "../define.js";

export default defineCard({
  name: "Broodmate Dragon",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a 4/4 red Dragon creature token with flying.",
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
