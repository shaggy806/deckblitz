import { defineCard } from "../define.js";

export default defineCard({
  name: "Head of the Homestead",
  manaCost: "{3}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Rabbit", "Citizen"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, create two 1/1 white Rabbit creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rabbit Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 white Rabbit creature tokens.",
    },
  ],
});
