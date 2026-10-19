import { defineCard } from "../define.js";

// EDHREC rank 17956.
//
// "That land" is the one this spell put onto the battlefield — the `thisWay`
// clause (Fabled Passage, Storm of Souls). "Becomes a 4/3" sets its base P/T
// (layer 7b); it keeps its land types and abilities.
const TEXT =
  "Search your library for a basic land card, put it onto the battlefield, then shuffle. Until end of turn, that land becomes a 4/3 Insect creature with reach and haste. It's still a land.";

export default defineCard({
  name: "Rampaging Growth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      {
        kind: "animate-all",
        filter: { type: "land", thisWay: "put-onto-battlefield" },
        power: 4,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Insect"],
        keywords: ["reach", "haste"],
        duration: "end-of-turn",
      },
    ],
  },
});
