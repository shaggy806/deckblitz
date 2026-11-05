import { defineCard } from "../define.js";

export default defineCard({
  name: "Celebrate the Harvest",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to X basic land cards, where X is the number of different powers among creatures you control. Put those cards onto the battlefield tapped, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "land", supertype: "basic" },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: { aggregate: "distinct", of: "power", filter: { type: "creature", controlledBy: "you" } },
  },
});
