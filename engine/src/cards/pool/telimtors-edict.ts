import { defineCard } from "../define.js";

// Mirage. EDHREC rank 22661.

export default defineCard({
  name: "Telim'Tor's Edict",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Exile target permanent you own or control.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ ownedBy: "you" }, { controlledBy: "you" }] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});
