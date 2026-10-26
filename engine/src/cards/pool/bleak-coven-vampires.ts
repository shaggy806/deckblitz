import { defineCard } from "../define.js";

// EDHREC rank 27870.

export default defineCard({
  name: "Bleak Coven Vampires",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 4,
  toughness: 3,
  text: "Metalcraft — When this creature enters, if you control three or more artifacts, target player loses 4 life and you gain 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "metalcraft" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
      },
      resolve: null,
      text: "Metalcraft — When this creature enters, if you control three or more artifacts, target player loses 4 life and you gain 4 life.",
    },
  ],
});
