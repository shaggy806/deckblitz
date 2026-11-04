import { defineCard } from "../define.js";

const TEXT =
  "{T}: Target unblocked attacking creature becomes blocked. Activate only during combat after blockers are declared. (This ability works on creatures that can't be blocked.)";

export default defineCard({
  name: "Trap Runner",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", unblocked: true } }],
      effect: { kind: "become-blocked", target: 0 },
      condition: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
