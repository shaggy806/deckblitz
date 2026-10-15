import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ATTACK_TEXT = "Whenever this creature attacks, tap target creature an opponent controls.";
const STATIC_TEXT = `Equipped creature gets +1/+1 and has reach and "${ATTACK_TEXT}"`;

export default defineCard({
  name: "Web-Shooters",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["reach"],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
