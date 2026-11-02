import { defineCard } from "../define.js";

const TEXT = "If you control four or fewer lands, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";
const CYCLE_TEXT = "Cycling—Sacrifice a land. (Sacrifice a land, Discard this card: Draw a card.)";

export default defineCard({
  name: "Edge of Autumn",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  cycling: { cost: "", also: { sacrifice: { filter: { type: "land" } } }, costText: "Sacrifice a land" },
  text: `${TEXT}\n${CYCLE_TEXT}`,
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 5 } },
    then: {
      kind: "search-library",
      filter: { supertype: "basic", type: "land" },
      destination: "battlefield",
      min: 0,
      max: 1,
      enterTapped: true,
    },
  },
});
