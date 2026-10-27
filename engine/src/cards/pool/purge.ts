import { defineCard } from "../define.js";

// EDHREC rank 30329.

export default defineCard({
  name: "Purge",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target artifact creature or black creature. It can't be regenerated.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", anyOf: [{ type: "artifact" }, { colors: ["B"] }] },
    },
  ],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
