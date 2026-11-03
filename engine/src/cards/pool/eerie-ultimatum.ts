import { defineCard } from "../define.js";

// Not targeted: chosen as it resolves, so the set rule reads names then.
export default defineCard({
  name: "Eerie Ultimatum",
  manaCost: "{W}{W}{B}{B}{B}{G}{G}",
  colors: ["W", "B", "G"],
  types: ["sorcery"],
  text: "Return any number of permanent cards with different names from your graveyard to the battlefield.",
  effect: {
    kind: "look-and-choose",
    zone: "graveyard",
    min: 0,
    max: 99,
    filter: { notTypes: ["instant", "sorcery"] },
    together: { distinctNames: true },
    destination: "battlefield",
    leftover: "stay",
  },
});
