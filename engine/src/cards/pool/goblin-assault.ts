import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, create a 1/1 red Goblin creature token with haste.";
const ATTACK_TEXT = "Goblin creatures attack each combat if able.";

export default defineCard({
  name: "Goblin Assault",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token (Haste)", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      // Every Goblin creature, whoever controls it (the ruling).
      affects: { scope: "filter", filter: { type: "creature", subtype: "Goblin" } },
      restrictions: ["must-attack"],
      text: ATTACK_TEXT,
    },
  ],
});
