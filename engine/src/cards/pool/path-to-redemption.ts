import { defineCard } from "../define.js";

const LOCK_TEXT = "Enchanted creature can't attack or block.";
const EXILE_TEXT =
  "{5}, Sacrifice this Aura: Exile enchanted creature. Create a 1/1 white Ally creature token. Activate only during your turn.";

export default defineCard({
  name: "Path to Redemption",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${LOCK_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["cant-attack", "cant-block"], text: LOCK_TEXT }],
  activated: [
    {
      cost: { mana: "{5}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "attached" },
          { kind: "create-token", token: "Ally Token", count: 1 },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
      condition: { kind: "your-turn" },
    },
  ],
});
