import { defineCard } from "../define.js";

export default defineCard({
  name: "Eager Glyphmage",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, create a 1/1 white and black Inkling creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Inkling Token (Emeritus of Truce)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 white and black Inkling creature token with flying.",
    },
  ],
});
