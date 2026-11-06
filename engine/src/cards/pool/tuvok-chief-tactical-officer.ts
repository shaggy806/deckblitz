import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Misleading Signpost's shape with up to two
// targets, each reselected (or not) in turn.

const TEXT =
  "When Tuvok enters during the declare attackers step, choose up to two target attacking creatures. For each of them, you may reselect which player or permanent that creature is attacking. (A creature can't attack its controller.)";
const ATTACKER = { kind: "permanent", filter: { type: "creature", attacking: true } } as const;

export default defineCard({
  name: "Tuvok, Chief Tactical Officer",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Officer"],
  power: 2,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      whileCondition: { kind: "turn-structure", steps: ["declare-attackers"] },
      targets: [
        { kind: "optional", of: ATTACKER },
        { kind: "optional", of: { kind: "other", of: ATTACKER, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reselect-attack", target: 0 },
          { kind: "reselect-attack", target: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
