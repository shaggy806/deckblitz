import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// Urza's Destiny. EDHREC rank 20399. Mogg War Marshal's shape, two tokens.
const TOKENS_TEXT = "When this creature enters or dies, create two 1/1 red Goblin creature tokens.";

export default defineCard({
  name: "Goblin Marshal",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 3,
  text: `Echo {4}{R}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\n${TOKENS_TEXT}`,
  triggered: [
    echo("{4}{R}{R}"),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
  ],
});
