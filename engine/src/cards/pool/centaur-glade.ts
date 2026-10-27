import { defineCard } from "../define.js";

export default defineCard({
  name: "Centaur Glade",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "{2}{G}{G}: Create a 3/3 green Centaur creature token.",
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Centaur Token", count: 1 },
      resolve: null,
      text: "{2}{G}{G}: Create a 3/3 green Centaur creature token.",
    },
  ],
});
