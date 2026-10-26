import { defineCard } from "../define.js";

// Portal. EDHREC rank 32005.
export default defineCard({
  name: "Return of the Nightstalkers",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return all Nightstalker permanent cards from your graveyard to the battlefield. Then destroy all Swamps you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "return-from-graveyard",
        filter: {
          subtype: "Nightstalker",
          typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
        },
        destination: "battlefield",
        count: "all",
      },
      { kind: "destroy-all", filter: { subtype: "Swamp", controlledBy: "you" } },
    ],
  },
});
