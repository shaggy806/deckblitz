import { defineCard } from "../define.js";

// EDHREC rank 18933.
// Makes Human Citizen → use "Human Citizen Token".

export default defineCard({
  name: "News Helicopter",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a 1/1 green and white Human Citizen creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Citizen Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 green and white Human Citizen creature token.",
    },
  ],
});
