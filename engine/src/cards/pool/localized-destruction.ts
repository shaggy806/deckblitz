import { defineCard } from "../define.js";

// EDHREC rank 8191.
export default defineCard({
  name: "Localized Destruction",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You get {E} (an energy counter), then you may pay one or more {E}. If you do, each creature you control with power equal to the amount of {E} paid this way gains indestructible until end of turn.\nDestroy all creatures.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 1 },
      {
        kind: "may",
        prompt: "Pay one or more {E}? Each creature you control with power equal to the amount paid gains indestructible until end of turn.",
        costEnergyX: "one-or-more",
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you", power: { op: "eq", n: { amount: "x" } } },
          keyword: "indestructible",
          duration: "end-of-turn",
        },
      },
      { kind: "destroy-all", filter: { type: "creature" } },
    ],
  },
});
