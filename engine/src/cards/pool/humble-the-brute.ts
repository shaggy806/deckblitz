import { defineCard } from "../define.js";

export default defineCard({
  name: "Humble the Brute",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature with power 4 or greater.\nInvestigate.(Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "create-token", token: "Clue Token", count: 1 }],
  },
});
