import { defineCard } from "../define.js";

// "You may waterbend {6}" is an optional additional cost (rule 601.2b), a
// kicker by another name (Ruinous Waterbending): paid, the spell does its
// "instead" in place of drawing two.
export default defineCard({
  name: "Spirit Water Revival",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may waterbend {6}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\nDraw two cards. If this spell's additional cost was paid, instead shuffle your graveyard into your library, draw seven cards, and you have no maximum hand size for the rest of the game.\nExile Spirit Water Revival.",
  exileOnResolve: true,
  kicker: {
    cost: "{6}",
    keyword: "waterbend",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "shuffle-graveyard-into-library", target: "you" },
        { kind: "draw", amount: 7 },
        { kind: "player-effect", duration: "permanent", noMaxHandSize: "you" },
      ],
    },
  },
  targets: [],
  effect: { kind: "draw", amount: 2 },
});
