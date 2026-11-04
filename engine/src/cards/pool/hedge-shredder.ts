import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// The second ability sees any move of land cards from your library to your
// graveyard, not only this Vehicle's own mill, and it works whether or not the
// Vehicle is crewed. The cards that moved together trigger it once, and each
// land among them still in the graveyard enters tapped, together.
const MILL_TEXT = "Whenever this Vehicle attacks, you may mill two cards.";
const LANDS_TEXT =
  "Whenever one or more land cards are put into your graveyard from your library, put them onto the battlefield tapped.";

export default defineCard({
  name: "Hedge Shredder",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: `${MILL_TEXT}\n${LANDS_TEXT}\n${crewText(1)}`,
  activated: [crew(1)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Mill two cards?", effect: { kind: "mill", target: "you", amount: 2 } },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "land" }, from: "library", batched: true },
      targets: [],
      effect: { kind: "put-arrived-onto-battlefield", count: "all", enterTapped: true },
      resolve: null,
      text: LANDS_TEXT,
    },
  ],
});
