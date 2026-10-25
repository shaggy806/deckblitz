import { defineCard } from "../define.js";

const TEXT = "When this creature enters or dies, mill two cards.";

// Its ruling: it triggers both as it enters and as it dies — two abilities.
export default defineCard({
  name: "Crow of Dark Tidings",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Put the top two cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
