import { defineCard } from "../define.js";

export default defineCard({
  name: "Envoy of Okinec Ahau",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Advisor"],
  power: 3,
  toughness: 3,
  text: "{4}{W}: Create a 1/1 colorless Gnome artifact creature token.",
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Token", count: 1 },
      resolve: null,
      text: "{4}{W}: Create a 1/1 colorless Gnome artifact creature token.",
    },
  ],
});
