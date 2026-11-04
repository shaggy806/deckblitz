import { defineCard } from "../define.js";

// Each card under its owner's control, all at once: `each-graveyard`.

export default defineCard({
  name: "Roar of Reclamation",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player returns all artifact cards from their graveyard to the battlefield.",
  targets: [],
  effect: {
    kind: "return-from-graveyard",
    from: "each-graveyard",
    filter: { type: "artifact" },
    destination: "battlefield",
    count: "all",
  },
});
