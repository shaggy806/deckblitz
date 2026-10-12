import { defineCard } from "../define.js";

export default defineCard({
  name: "Not on My Watch",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target attacking creature.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: { kind: "exile", target: 0 },
});
