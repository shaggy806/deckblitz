import { defineCard } from "../define.js";

// EDHREC rank 18621.
//
// Fantastic Bounce's shape: the reduction applies when the target chosen as
// it's cast is an attacking creature (rules 601.2c, 601.2f).

export default defineCard({
  name: "Depower",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets an attacking creature.\nTarget creature gets -4/-0 until end of turn.\nDraw a card.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", attacking: true }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
