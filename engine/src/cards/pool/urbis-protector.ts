import { defineCard } from "../define.js";

export default defineCard({
  name: "Urbis Protector",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, create a 4/4 white Angel creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Angel Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 4/4 white Angel creature token with flying.",
    },
  ],
});
