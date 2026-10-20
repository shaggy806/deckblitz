import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// EDHREC rank 15949.
//
// "Three or more basic land types among lands you control" holds exactly when
// some three of the five types each appear on a land you control (a dual land
// counts for both of its types), so it's the `any` of the ten three-type
// combinations, each an `all` of `controls` (Nael, Avizoa Aeronaut checks all
// five the same way). It's read after the fetched land has entered.

const BASIC_TYPES = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;
const hasType = (subtype: string): StaticCondition => ({
  kind: "controls",
  filter: { type: "land", subtype },
  atLeast: 1,
});
const THREE_TYPES: StaticCondition[] = BASIC_TYPES.flatMap((first, i) =>
  BASIC_TYPES.slice(i + 1).flatMap((second, j) =>
    BASIC_TYPES.slice(i + j + 2).map(
      (third): StaticCondition => ({ kind: "all", of: [hasType(first), hasType(second), hasType(third)] }),
    ),
  ),
);

export default defineCard({
  name: "Path to the Festival",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{4}{G}" },
  text: "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle. Then if there are three or more basic land types among lands you control, scry 1. (Look at the top card of your library. You may put that card on the bottom.)\nFlashback {4}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      { kind: "conditional", condition: { kind: "any", of: THREE_TYPES }, then: { kind: "scry", amount: 1 } },
    ],
  },
});
