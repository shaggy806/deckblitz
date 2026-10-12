import { defineCard } from "../define.js";

export default defineCard({
  name: "Oltec Cloud Guard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a 1/1 colorless Gnome artifact creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 colorless Gnome artifact creature token.",
    },
  ],
});
