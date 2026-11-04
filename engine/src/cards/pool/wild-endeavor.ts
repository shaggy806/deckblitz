import { defineCard } from "../define.js";

export default defineCard({
  name: "Wild Endeavor",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Roll two d4 and choose one result. Create a number of 3/3 green Beast creature tokens equal to that result. Then search your library for a number of basic land cards equal to the other result, put them onto the battlefield tapped, then shuffle.",
  effect: {
    kind: "roll-dice",
    sides: 4,
    count: 2,
    then: {
      kind: "choose-value",
      value: "roll-result",
      then: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "3/3 Beast Token", count: "x" },
          {
            kind: "search-library",
            filter: { supertype: "basic", type: "land" },
            destination: "battlefield",
            enterTapped: true,
            min: 0,
            max: { roll: "other" },
          },
        ],
      },
    },
  },
});
