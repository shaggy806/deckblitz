import { defineCard } from "../define.js";

export default defineCard({
  name: "Choking Fumes",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put a -1/-1 counter on each attacking creature.",
  effect: { kind: "add-counter-all", filter: { type: "creature", attacking: true }, counter: "-1/-1", amount: 1 },
});
