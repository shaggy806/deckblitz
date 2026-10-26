import { defineCard } from "../define.js";

const ENTER_TEXT = "This Equipment enters with X charge counters on it.";
const PT_TEXT = "Equipped creature gets +1/+1 for each charge counter on this Equipment.";
const EQUIP_TEXT = "Equip—Remove a charge counter from this Equipment.";

export default defineCard({
  name: "Sigil of Distinction",
  manaCost: "{X}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${PT_TEXT}\n${EQUIP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: "x" } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "charge", pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      // Equip (rule 702.6a) with a non-mana cost: with no charge counter it can't be activated (the ruling).
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
    },
  ],
});
