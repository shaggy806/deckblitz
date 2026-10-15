import { defineCard } from "../define.js";

// EDHREC rank 14627.
// Makes Goblin → use "Goblin Token (Boggart Mischief)".

export default defineCard({
  name: "Elder Auntie",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a 1/1 black and red Goblin creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token (Boggart Mischief)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 black and red Goblin creature token.",
    },
  ],
});
