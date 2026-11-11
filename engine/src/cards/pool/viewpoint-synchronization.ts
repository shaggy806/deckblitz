import { defineCard } from "../define.js";

// The finds are chosen and revealed, then the searcher picks which two enter tapped; the other
// goes to hand. With one or two found, they all go onto the battlefield: "the other" can't be
// followed, so the spell does as much as it can (rule 609.3).

export default defineCard({
  name: "Viewpoint Synchronization",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Freerunning {2}{G} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nSearch your library for up to three basic land cards and reveal them. Put two of them onto the battlefield tapped and the other into your hand, then shuffle.",
  freerunning: { cost: "{2}{G}" },
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    min: 0,
    max: 3,
    reveal: true,
    destination: "hand",
    instead: { destination: "battlefield", enterTapped: true, pick: { exactly: 2 } },
  },
});
