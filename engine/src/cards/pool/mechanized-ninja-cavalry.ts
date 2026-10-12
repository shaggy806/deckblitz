import { defineCard } from "../define.js";

export default defineCard({
  name: "Mechanized Ninja Cavalry",
  manaCost: "{1}{R/W}",
  colors: ["W", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Ninja"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create a 1/1 colorless Robot artifact creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Big Mother Mouser)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 colorless Robot artifact creature token.",
    },
  ],
});
