import { defineCard } from "../define.js";

// Rulings:
//   [2010-08-15] All creatures you put onto the battlefield with Mass Polymorph enter at the same
//     time.
//   [2010-08-15] If the number of creatures you exile is greater than the number of creature cards
//     remaining in your library, you'll wind up revealing your entire library, putting all
//     creature cards revealed that way onto the battlefield, then shuffling your library.

export default defineCard({
  name: "Mass Polymorph",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exile all creatures you control, then reveal cards from the top of your library until you reveal that many creature cards. Put all creature cards revealed this way onto the battlefield, then shuffle the rest of the revealed cards into your library.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature", controlledBy: "you" } },
      {
        kind: "reveal-until-count",
        filter: { type: "creature" },
        count: { thisWay: "exiled" },
        rest: "shuffle",
      },
    ],
  },
});
