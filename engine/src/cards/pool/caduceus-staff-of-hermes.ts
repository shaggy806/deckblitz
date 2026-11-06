import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "You" in the condition is the Equipment's controller. The quoted prevention
// is the equipped creature's own static while it's granted (`grantsStatic`,
// rule 113.10): "this creature" is that creature. Its ruling: damage dealt as
// your life reaches 30 isn't prevented, but the creature has indestructible
// before state-based actions are checked — the condition is read as each is.

const LIFELINK = "Equipped creature has lifelink.";
const AT_30 =
  'As long as you have 30 or more life, equipped creature gets +5/+5 and has indestructible and "Prevent all damage that would be dealt to this creature."';

export default defineCard({
  name: "Caduceus, Staff of Hermes",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${LIFELINK}\n${AT_30}\nEquip {W}{W}`,
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["lifelink"],
      text: LIFELINK,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "life-total", atLeast: 30 },
      grantPt: [5, 5],
      grantKeywords: ["indestructible"],
      grantsStatic: [
        {
          affects: { scope: "self" },
          replacement: { event: "would-deal-damage", prevent: true, to: "self" },
          text: "Prevent all damage that would be dealt to this creature.",
        },
      ],
      text: AT_30,
    },
  ],
  activated: [equip("{W}{W}")],
});
