import { defineCard } from "../define.js";

export default defineCard({
  name: "Prideful Parent",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\nWhen this creature enters, create a 1/1 white Cat creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Cat Token (Arahbo, the First Fang)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 white Cat creature token.",
    },
  ],
});
