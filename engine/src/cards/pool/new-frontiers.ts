import { defineCard } from "../define.js";

// Each player in turn order decides; one who declines doesn't search or
// shuffle (Boldwyr Heavyweights' shape).
export default defineCard({
  name: "New Frontiers",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player may search their library for up to X basic land cards and put them onto the battlefield tapped. Then each player who searched their library this way shuffles.",
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "each-player",
    prompt: "Search your library for up to X basic land cards and put them onto the battlefield tapped?",
    effect: {
      kind: "search-library",
      filter: { supertype: "basic", type: "land" },
      destination: "battlefield",
      min: 0,
      max: "x",
      enterTapped: true,
    },
  },
});
