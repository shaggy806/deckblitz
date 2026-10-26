import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). "Its controller" is the entering land's
// controller — the trigger object's (`trigger-controller`), not this
// enchantment's.
const TEXT = "Whenever a land enters, its controller creates a 1/1 green Snake creature token.";

export default defineCard({
  name: "Seed the Land",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Snake Token", count: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
