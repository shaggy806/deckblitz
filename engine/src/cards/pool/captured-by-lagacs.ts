import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const SUPPORT_TEXT =
  "When this Aura enters, support 2. (Put a +1/+1 counter on each of up to two target creatures.)";

export default defineCard({
  name: "Captured by Lagacs",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack or block.\n${SUPPORT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Support N on a permanent: "each of up to N other target creatures"
      // (rule 701.41a) — any player's, the enchanted one included.
      targets: distinctTargets(2, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
  ],
});
