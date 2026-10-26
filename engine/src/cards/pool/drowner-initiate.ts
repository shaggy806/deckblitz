import { defineCard } from "../define.js";

const TEXT = "Whenever a player casts a blue spell, you may pay {1}. If you do, target player mills two cards.";

export default defineCard({
  name: "Drowner Initiate",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["U"] } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have the target player mill two cards?",
        cost: "{1}",
        effect: { kind: "mill", target: 0, amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
