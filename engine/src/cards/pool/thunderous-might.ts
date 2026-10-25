import { defineCard } from "../define.js";

// EDHREC rank 18584. Devotion is counted as the trigger resolves (its ruling).
const TEXT =
  "Whenever enchanted creature attacks, it gets +X/+0 until end of turn, where X is your devotion to red. (Each {R} in the mana costs of permanents you control counts toward your devotion to red.)";

export default defineCard({
  name: "Thunderous Might",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: { devotionTo: "R" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
