import { defineCard } from "../define.js";

export default defineCard({
  name: "Wisdom of Ages",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return all instant and sorcery cards from your graveyard to your hand. You have no maximum hand size for the rest of the game.\nExile Wisdom of Ages.",
  exileOnResolve: true,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-from-graveyard", filter: { typesAnyOf: ["instant", "sorcery"] }, destination: "hand", count: "all" },
      { kind: "player-effect", duration: "rest-of-game", noMaxHandSize: "you" },
    ],
  },
});
