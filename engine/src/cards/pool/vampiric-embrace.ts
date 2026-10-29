import { defineCard } from "../define.js";

// "That creature" is the enchanted creature. The damage counts only while it
// was this creature: dealt by it in its stint on the battlefield now.
const BONUS = "Enchanted creature gets +2/+2 and has flying.";
const TEXT = "Whenever a creature dealt damage by enchanted creature this turn dies, put a +1/+1 counter on that creature.";

export default defineCard({
  name: "Vampiric Embrace",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BONUS}\n${TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "creature" } }],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], grantKeywords: ["flying"], text: BONUS }],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "host" } } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
