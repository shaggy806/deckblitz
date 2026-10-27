import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 22769.

export default defineCard({
  name: "Penumbra Bobcat",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, create a 2/1 black Cat creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "2/1 Black Cat Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 2/1 black Cat creature token.",
    },
  ],
});
