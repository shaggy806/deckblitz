import { defineCard } from "../define.js";

export default defineCard({
  name: "Glimmerburst",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards. Create a 1/1 white Glimmer enchantment creature token.",
  effect: {
    kind: "sequence",
    effects: [{ kind: "draw", amount: 2 }, { kind: "create-token", token: "Glimmer Token", count: 1 }],
  },
});
