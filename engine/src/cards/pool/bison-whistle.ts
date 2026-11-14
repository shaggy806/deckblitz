import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 23455. One look at the top card, whose kind decides the offers:
// a creature card may go onto the battlefield if it's a Bison, else (or
// instead) be revealed and put into the hand; any other card may go onto the
// battlefield if it's a Bison (a Kindred card with changeling) and otherwise
// into the graveyard. The second choice is asked only when the first took
// nothing. An instant or sorcery can't be put onto the battlefield (rule
// 304.4, 307.4), so a Bison one is left for "otherwise".
const TEXT =
  "{1}, {T}: Look at the top card of your library. If it's a Bison card, you may put it onto the battlefield. If it's a creature card, you may reveal it and put it into your hand. Otherwise, you may put it into your graveyard.";

const BISON: CardFilter = { subtype: "Bison", notTypes: ["instant", "sorcery"] };

export default defineCard({
  name: "Bison Whistle",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "library-top", filter: { type: "creature" } },
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          reveal: "chosen",
          min: 0,
          max: 1,
          filter: BISON,
          destination: "battlefield",
          secondPick: { filter: { type: "creature" }, min: 0, max: 1, destination: "hand", ifNoneChosen: true },
          leftover: "stay",
        },
        else: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          min: 0,
          max: 1,
          filter: BISON,
          destination: "battlefield",
          secondPick: { min: 0, max: 1, destination: "graveyard", ifNoneChosen: true },
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
