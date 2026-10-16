import { defineCard } from "../define.js";

// EDHREC rank 11736.
//
// Rulings:
//   [2024-07-26] Hired Claw’s activated ability cares whether an opponent lost life this turn, not
//     how their life total changed. For example, an opponent who gained 2 life and lost 1 life in
//     the same turn still lost life.
//
// "Whenever you attack with one or more Lizards" is an `attack-with` trigger
// (once per declaration) narrowed to Lizards; the activation's two limits are
// its `condition` (the `life-lost` turn stat) and `oncePerTurn`.

const ATTACK_TEXT = "Whenever you attack with one or more Lizards, this creature deals 1 damage to target opponent.";
const GROW_TEXT =
  "{1}{R}: Put a +1/+1 counter on this creature. Activate only if an opponent lost life this turn and only once each turn.";

export default defineCard({
  name: "Hired Claw",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Mercenary"],
  power: 1,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtype: "Lizard" } },
      targets: ["opponent"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
