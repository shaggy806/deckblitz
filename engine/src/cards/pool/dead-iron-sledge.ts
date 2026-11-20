import { defineCard } from "../define.js";

// Once for each creature it blocks or is blocked by. "Both creatures" are the
// creature equipped as it triggered and that creature: moving the Sledge
// afterwards changes neither (the ruling), and both are destroyed at once.
const TEXT = "Whenever equipped creature blocks or becomes blocked by a creature, destroy both creatures.";
const DESTROY_BOTH = {
  kind: "sequence",
  simultaneous: true,
  effects: [
    { kind: "destroy", target: "trigger-object" },
    { kind: "destroy", target: "attached-as-triggered" },
  ],
} as const;

export default defineCard({
  name: "Dead-Iron Sledge",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
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
      effect: DESTROY_BOTH,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: DESTROY_BOTH,
      resolve: null,
      text: TEXT,
    },
  ],
});
