import { defineCard } from "../define.js";

// EDHREC rank 8317.
// Heartbeat of Spring's trigger, on a creature.

const TEXT = "Whenever a player taps a land for mana, that player adds one mana of any type that land produced.";

export default defineCard({
  name: "Zhur-Taa Ancient",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-mana", mana: "produced", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
