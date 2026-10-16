import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 12438.
//
// The land isn't played (the ruling): it goes onto the battlefield whatever
// the land count this turn. A card that isn't a land stays on top.
const HASTE = "This Vehicle has haste as long as you control a Mount.";
const ATTACK =
  "Whenever this Vehicle attacks, look at the top card of your library. If it's a land card, you may put it onto the battlefield tapped.";

export default defineCard({
  name: "Mobile Homestead",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  text: `${HASTE}\n${ATTACK}\n${crewText(2)}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Mount" }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: HASTE,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  activated: [crew(2)],
});
