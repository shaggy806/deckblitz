import { defineCard } from "../define.js";

/** The colorless Book Equipment named Wasteland Survival Guide (Moira
 * Brown, Guide Author). Keyed " Token", named by `tokenName`. */
const PT_TEXT = "Equipped creature gets +1/+1 for each quest counter among permanents you control.";

export default defineCard({
  name: "Wasteland Survival Guide Token",
  tokenName: "Wasteland Survival Guide",
  art: "ad073c87-42f2-45f0-9613-2cdbd0abf719",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book", "Equipment"],
  text: `${PT_TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersAmong: { counter: "quest", filter: { controlledBy: "you" } }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
