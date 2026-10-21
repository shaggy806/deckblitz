import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a blue spell, target player mills two cards.";

export default defineCard({
  name: "Drowned Secrets",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
