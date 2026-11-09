import { defineCard } from "../define.js";

// EDHREC rank 2321.
export default defineCard({
  name: "Kindred Summons",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose a creature type. Reveal cards from the top of your library until you reveal X creature cards of the chosen type, where X is the number of creatures you control of that type. Put those cards onto the battlefield, then shuffle the rest of the revealed cards into your library.",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "reveal-until-count",
      filter: { type: "creature", subtype: "$chosen" },
      count: { countOf: { type: "creature", subtype: "$chosen", controlledBy: "you" } },
      put: "battlefield",
      rest: "shuffle",
    },
  },
});
