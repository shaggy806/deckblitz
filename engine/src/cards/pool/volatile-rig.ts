import { defineCard } from "../define.js";

// EDHREC rank 18238. Return to Ravnica.
//
// Rulings:
//   If Volatile Rig is dealt damage by multiple sources at the same time (for example, multiple
//     blocking creatures), its first triggered ability will trigger only once.
//
// `dealt-damage` batches simultaneous damage to one permanent into one
// trigger, as the ruling wants. The dies trigger's damage comes from the Rig
// as it last existed, to each creature and each player as one event.

const MUST_ATTACK_TEXT = "This creature attacks each combat if able.";
const DAMAGED_TEXT = "Whenever this creature is dealt damage, flip a coin. If you lose the flip, sacrifice this creature.";
const DIES_TEXT =
  "When this creature dies, flip a coin. If you lose the flip, it deals 4 damage to each creature and each player.";

export default defineCard({
  name: "Volatile Rig",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${MUST_ATTACK_TEXT}\n${DAMAGED_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "flip-coin", lost: { kind: "sacrifice-source" } },
      resolve: null,
      text: DAMAGED_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        lost: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage-all", filter: { type: "creature" }, amount: 4 },
            { kind: "damage", amount: 4, who: "each-player" },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: MUST_ATTACK_TEXT,
    },
  ],
});
