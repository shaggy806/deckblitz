import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 26902.

export default defineCard({
  name: "Turn to Dust",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target Equipment. Add {G}.",
  targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Equipment" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "add-mana", mana: "G", amount: 1 },
    ],
  },
});
