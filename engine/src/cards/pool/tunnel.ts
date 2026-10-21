import { defineCard } from "../define.js";

// EDHREC rank 31754.

export default defineCard({
  name: "Tunnel",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target Wall. It can't be regenerated.",
  targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
