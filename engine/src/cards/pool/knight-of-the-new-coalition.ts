import { defineCard } from "../define.js";

export default defineCard({
  name: "Knight of the New Coalition",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, create a 2/2 white and blue Knight creature token with vigilance.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token (Chivalric Alliance)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 2/2 white and blue Knight creature token with vigilance.",
    },
  ],
});
