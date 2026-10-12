import { defineCard } from "../define.js";

export default defineCard({
  name: "Guiding Bolt",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature with power 4 or greater.\nScry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "sequence", effects: [{ kind: "destroy", target: 0 }, { kind: "scry", amount: 2 }] },
});
