import { defineCard } from "../define.js";

// "During the declare attackers step" is part of the trigger condition. The target
// may be any attacker; the "may" is the answer that leaves it where it is.
const TEXT =
  "When this artifact enters during the declare attackers step, you may reselect which player or permanent target attacking creature is attacking. (It can't attack its controller or their permanents.)";

export default defineCard({
  name: "Misleading Signpost",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash\n${TEXT}\n{T}: Add {U}.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      whileCondition: { kind: "turn-structure", steps: ["declare-attackers"] },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: { kind: "reselect-attack", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
  ],
});
