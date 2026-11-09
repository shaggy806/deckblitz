import { defineCard } from "../define.js";

// Once for each creature it blocks or is blocked by.
const TEXT =
  "Whenever equipped creature blocks or becomes blocked by a creature, that creature loses all abilities until end of turn.";
const LOSES = { kind: "become", loseAbilities: true, target: "trigger-object", duration: "end-of-turn" } as const;

export default defineCard({
  name: "Barrow-Blade",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached", object: "blocked" },
      targets: [],
      effect: LOSES,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: LOSES,
      resolve: null,
      text: TEXT,
    },
  ],
});
