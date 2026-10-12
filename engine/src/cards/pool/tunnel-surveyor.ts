import { defineCard } from "../define.js";

export default defineCard({
  name: "Tunnel Surveyor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a 1/1 white Glimmer enchantment creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Glimmer Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 white Glimmer enchantment creature token.",
    },
  ],
});
