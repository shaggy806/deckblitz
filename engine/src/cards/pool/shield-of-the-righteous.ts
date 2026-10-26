import { defineCard } from "../define.js";

const BLOCK_TEXT =
  "Whenever equipped creature blocks a creature, that creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Shield of the Righteous",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +0/+2 and has vigilance.\n${BLOCK_TEXT}\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached", object: "blocked" },
      targets: [],
      effect: { kind: "tap", target: "trigger-object", doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      grantKeywords: ["vigilance"],
      text: "Equipped creature gets +0/+2 and has vigilance.",
    },
  ],
});
