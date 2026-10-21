import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals combat damage to a player, each player mills a card.";

export default defineCard({
  name: "Eye Collector",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Each player puts the top card of their library into their graveyard.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
