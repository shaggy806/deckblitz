import { defineCard } from "../define.js";

export default defineCard({
  name: "Praetor's Counsel",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return all cards from your graveyard to your hand. Exile Praetor's Counsel. You have no maximum hand size for the rest of the game.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-from-graveyard", filter: {}, destination: "hand", count: "all" },
      { kind: "exile", target: "source" },
      { kind: "player-effect", duration: "permanent", noMaxHandSize: "you" },
    ],
  },
});
