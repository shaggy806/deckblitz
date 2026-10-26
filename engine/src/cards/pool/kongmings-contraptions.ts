import { defineCard } from "../define.js";

// Portal Three Kingdoms. EDHREC rank 30957.
//
// "Activate only during the declare attackers step and only if you've been
// attacked this step" is the Portal cast gate `attacked-this-step` (Assassin's
// Blade), which already checks the step, as the ability's condition.

const TEXT =
  "{T}: This creature deals 2 damage to target attacking creature. Activate only during the declare attackers step and only if you've been attacked this step.";

export default defineCard({
  name: "Kongming's Contraptions",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      condition: { kind: "attacked-this-step" },
      text: TEXT,
    },
  ],
});
