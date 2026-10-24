import { defineCard } from "../define.js";

// Delirium is read as the spell resolves, after the exile and before the
// spell itself reaches the graveyard (the rulings).
export default defineCard({
  name: "Descend upon the Sinful",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile all creatures.\nDelirium — Create a 4/4 white Angel creature token with flying if there are four or more card types among cards in your graveyard.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature" } },
      {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: { kind: "create-token", token: "4/4 Angel Token", count: 1 },
      },
    ],
  },
});
