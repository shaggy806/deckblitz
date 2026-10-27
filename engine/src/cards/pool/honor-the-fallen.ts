import { defineCard } from "../define.js";

// EDHREC rank 15142.

export default defineCard({
  name: "Honor the Fallen",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile all creature cards from all graveyards. You gain 1 life for each card exiled this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "each-player", filter: { type: "creature" } },
      { kind: "gain-life", amount: { thisWay: "exiled" } },
    ],
  },
});
