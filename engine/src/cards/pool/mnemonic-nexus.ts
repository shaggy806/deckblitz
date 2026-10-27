import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). The spell is on the stack as it resolves, so it isn't shuffled in
// with its own effect (its ruling).

export default defineCard({
  name: "Mnemonic Nexus",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Each player shuffles their graveyard into their library.",
  targets: [],
  effect: { kind: "shuffle-graveyard-into-library", target: "each-player" },
});
