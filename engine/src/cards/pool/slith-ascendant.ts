import { defineCard } from "../define.js";

export default defineCard({
  name: "Slith Ascendant",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Slith"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.",
    },
  ],
});
