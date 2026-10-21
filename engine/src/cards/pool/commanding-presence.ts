import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const GRANTED_TEXT = "Whenever this creature deals combat damage to a player, create a 1/1 white Human Soldier creature token.";
const GRANTED: TriggeredAbility = {
  trigger: { on: "deals-combat-damage-to-player", who: "self" },
  targets: [],
  effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
  resolve: null,
  text: GRANTED_TEXT,
};
const STATIC_TEXT = `Enchanted creature gets +2/+2 and has first strike and "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Commanding Presence",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["first-strike"],
      grantsTriggered: [GRANTED],
      text: STATIC_TEXT,
    },
  ],
});
