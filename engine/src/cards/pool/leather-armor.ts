import { defineCard } from "../define.js";
import { equip, ward } from "../helpers.js";

// EDHREC rank 10009. Dwarven Mattock's ward grant; equip {0} once each turn
// (still sorcery-speed, rule 702.6a). A creature with ward of its own gets
// both triggers (the ruling).

const STATIC_TEXT = "Equipped creature gets +0/+1 and has ward {1}.";
const EQUIP_TEXT = "Equip {0}. Activate only once each turn.";

export default defineCard({
  name: "Leather Armor",
  manaCost: "{1}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT} (Whenever equipped creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\n${EQUIP_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 1],
      grantsTriggered: [ward({ mana: "{1}" })],
      text: STATIC_TEXT,
    },
  ],
  activated: [{ ...equip("{0}"), oncePerTurn: true, text: EQUIP_TEXT }],
});
