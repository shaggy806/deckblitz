import { defineCard } from "../define.js";

// EDHREC rank 28491. "Blocks or becomes blocked by a Vampire" is one ability
// with two events (Mammoth Harness's shape): the equipped creature blocking —
// the blocked creature is the trigger object, and its being a Vampire is part
// of the trigger condition (a `whileCondition`, asked only as it blocks) — and
// the equipped creature becoming blocked by a Vampire, once per blocker. The
// Vampire is destroyed before combat damage (its ruling).

const TEXT =
  "Whenever equipped creature blocks or becomes blocked by a Vampire, destroy that creature. It can't be regenerated.";
const DESTROY = { kind: "destroy", target: "trigger-object", cantBeRegenerated: true } as const;

export default defineCard({
  name: "Wooden Stake",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+0.\n${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { subtype: "Vampire" } },
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "attached", blocker: { subtype: "Vampire" } },
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY,
      resolve: null,
      text: TEXT,
    },
  ],
});
