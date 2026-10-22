import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 25040.

const TEXT = "Whenever an Island an opponent controls becomes tapped, you may gain 1 life.";

export default defineCard({
  name: "Thoughtleech",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { subtype: "Island", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
