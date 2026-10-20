import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 9737.
//
// Mobile Homestead's trigger: the land isn't played, and a nonland stays on
// top.
const ATTACK =
  "Whenever this Vehicle attacks, look at the top card of your library. If it's a land card, you may put it onto the battlefield tapped.";

export default defineCard({
  name: "Raiders' Karve",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${ATTACK}\n${crewText(3)}`,
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
  activated: [crew(3)],
});
