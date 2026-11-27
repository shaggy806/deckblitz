import { defineCard } from "../define.js";

// EDHREC rank 24310.
//
// "Becomes blocked by one or more colorless creatures" is `becomes-blocked`'s
// `blockers.filter`, read as the declaration completes: once however many
// block it (rule 509.3c). "It" is the equipped creature, the trigger object.
const BLOCKED_TEXT =
  "Whenever equipped creature becomes blocked by one or more colorless creatures, it gains deathtouch until end of turn.";

export default defineCard({
  name: "Hedron Blade",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${BLOCKED_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      text: "Equipped creature gets +1/+1.",
    },
  ],
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
      trigger: { on: "becomes-blocked", who: "attached", blockers: { filter: { colorless: true } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
