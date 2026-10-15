import { defineCard } from "../define.js";

// EDHREC rank 12186.
// Makes Human Citizen → use "Human Citizen Token".

export default defineCard({
  name: "Spider-Girl, Legacy Hero",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 2,
  toughness: 2,
  text: "During your turn, Spider-Girl has flying.\nWhen Spider-Girl leaves the battlefield, create a 1/1 green and white Human Citizen creature token.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Citizen Token", count: 1 },
      resolve: null,
      text: "When Spider-Girl leaves the battlefield, create a 1/1 green and white Human Citizen creature token.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying"],
      text: "During your turn, Spider-Girl has flying.",
    },
  ],
});
