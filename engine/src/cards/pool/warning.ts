import { defineCard } from "../define.js";

// EDHREC rank 29032.

export default defineCard({
  name: "Warning",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt by target attacking creature this turn.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
});
