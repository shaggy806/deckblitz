import { defineCard } from "../define.js";

// Theros Beyond Death. The can't-block half applies even when the damage is
// prevented, as long as the target is still legal (its ruling).

const ACTIVATED =
  "{1}{R}, {T}, Sacrifice a creature or enchantment: This creature deals 1 damage to target creature. That creature can't block this turn.";

export default defineCard({
  name: "Blood Aspirant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr", "Berserker"],
  power: 1,
  toughness: 1,
  text: `Whenever you sacrifice a permanent, put a +1/+1 counter on this creature.\n${ACTIVATED}`,
  activated: [
    {
      cost: {
        mana: "{1}{R}",
        tap: true,
        sacrifice: { filter: { typesAnyOf: ["creature", "enchantment"] } },
      },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: ACTIVATED,
    },
  ],
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you sacrifice a permanent, put a +1/+1 counter on this creature.",
    },
  ],
});
