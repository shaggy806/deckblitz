import { defineCard } from "../define.js";

const PUMP = "Enchanted creature gets +1/+2.";
const MOVE = "{2}{U}: Attach this Aura to target creature other than enchanted creature.";

export default defineCard({
  name: "Kjeldoran Pride",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${MOVE}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: PUMP }],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", hostOfSource: false } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: MOVE,
    },
  ],
});
