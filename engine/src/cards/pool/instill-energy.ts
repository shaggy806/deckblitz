import { defineCard } from "../define.js";

const ATTACK = "Enchanted creature can attack as though it had haste.";
const UNTAP = "{0}: Untap enchanted creature. Activate only during your turn and only once each turn.";

// It gives no haste (rules 302.6, 702.10b): the enchanted creature may be
// declared as an attacker the turn it came under its controller's control,
// and its {T} abilities stay shut (702.10c).
export default defineCard({
  name: "Instill Energy",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACK}\n${UNTAP}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, attackAsThoughHaste: true, text: ATTACK }],
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      condition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: UNTAP,
    },
  ],
});
