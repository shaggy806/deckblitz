import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const DAMAGE_TEXT =
  "Whenever equipped creature deals combat damage to a player, create that many 1/1 green and white Citizen creature tokens.";

export default defineCard({
  name: "Scepter of Celebration",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+0 and has trample.\n${DAMAGE_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +2/+0 and has trample.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
