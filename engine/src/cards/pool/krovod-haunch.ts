import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const FOOD_TEXT = "{2}, {T}, Sacrifice this Equipment: You gain 3 life.";
const DOGS_TEXT =
  "When this Equipment is put into a graveyard from the battlefield, you may pay {1}{W}. If you do, create two 1/1 white Dog creature tokens.";

export default defineCard({
  name: "Krovod Haunch",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Food", "Equipment"],
  text: `Equipped creature gets +2/+0.\n${FOOD_TEXT}\n${DOGS_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: FOOD_TEXT,
    },
    equip("{2}"),
  ],
  triggered: [
    {
      // "Put into a graveyard from the battlefield" (Nihil Spellbomb's shape).
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} to create two 1/1 white Dog creature tokens?",
        cost: "{1}{W}",
        effect: { kind: "create-token", token: "1/1 White Dog Token", count: 2 },
      },
      resolve: null,
      text: DOGS_TEXT,
    },
  ],
});
