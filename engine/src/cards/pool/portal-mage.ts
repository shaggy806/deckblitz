import { defineCard } from "../define.js";

// EDHREC rank 10476.

export default defineCard({
  name: "Portal Mage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters during the declare attackers step, you may reselect which player or permanent target attacking creature is attacking. (It can't attack its controller or their permanents.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "reselect-attack", target: 0 },
      resolve: null,
      text: "When this creature enters during the declare attackers step, you may reselect which player or permanent target attacking creature is attacking.",
      whileCondition: { kind: "turn-structure", steps: ["declare-attackers"] },
    },
  ],
});
