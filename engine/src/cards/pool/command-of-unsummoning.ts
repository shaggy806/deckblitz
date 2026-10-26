import { defineCard } from "../define.js";

// EDHREC rank 28665.

const ATTACKING = { kind: "permanent", filter: { type: "creature", attacking: true } } as const;

export default defineCard({
  name: "Command of Unsummoning",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nReturn one or two target attacking creatures to their owner's hand.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [ATTACKING, { kind: "optional", of: { kind: "other", of: ATTACKING, than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
