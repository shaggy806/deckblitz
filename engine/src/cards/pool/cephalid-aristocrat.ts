import { defineCard } from "../define.js";

export default defineCard({
  name: "Cephalid Aristocrat",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Noble"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature becomes the target of a spell or ability, mill two cards.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: "Whenever this creature becomes the target of a spell or ability, mill two cards.",
    },
  ],
});
