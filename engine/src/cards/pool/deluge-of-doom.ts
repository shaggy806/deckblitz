import { defineCard } from "../define.js";

// EDHREC rank 10506. X is counted once, as it resolves (rule 608.2h), and
// locked in for the turn.
const X = { cardTypesInGraveyard: { ownedBy: "you" } } as const;

export default defineCard({
  name: "Deluge of Doom",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -X/-X until end of turn, where X is the number of card types among cards in your graveyard.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: { product: [X, -1] },
    toughness: { product: [X, -1] },
    duration: "end-of-turn",
  },
});
