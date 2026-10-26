import { defineCard } from "../define.js";

export default defineCard({
  name: "Death Rattle",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["instant"],
  delve: true,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nDestroy target nongreen creature. It can't be regenerated.",
  targets: [{ kind: "permanent", filter: { type: "creature", notColors: ["G"] } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
