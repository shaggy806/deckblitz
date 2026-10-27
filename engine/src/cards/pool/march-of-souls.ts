import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 18647.
//
// Rampage of the Clans' shape: every creature the wrath destroyed counts for
// its controller as it left (an indestructible one wasn't destroyed), and each
// player creates that many Spirits once all of them are gone.

export default defineCard({
  name: "March of Souls",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all creatures. They can't be regenerated. For each creature destroyed this way, its controller creates a 1/1 white Spirit creature token with flying.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
      {
        kind: "create-token",
        token: "Spirit Token",
        who: "each-player",
        count: { thisWay: "destroyed", who: "each" },
      },
    ],
  },
});
