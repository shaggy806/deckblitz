import { defineCard } from "../define.js";

export default defineCard({
  name: "Knightfisher",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Knight"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever another nontoken Bird you control enters, create a 1/1 blue Fish creature token.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, subtype: "Bird" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Fish Token", count: 1 },
      resolve: null,
      text: "Whenever another nontoken Bird you control enters, create a 1/1 blue Fish creature token.",
    },
  ],
});
