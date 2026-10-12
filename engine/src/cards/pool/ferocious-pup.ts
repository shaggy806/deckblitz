import { defineCard } from "../define.js";

export default defineCard({
  name: "Ferocious Pup",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 0,
  toughness: 1,
  text: "When this creature enters, create a 2/2 green Wolf creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 2/2 green Wolf creature token.",
    },
  ],
});
