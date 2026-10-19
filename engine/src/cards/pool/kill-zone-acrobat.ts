import { defineCard } from "../define.js";

// EDHREC rank 29978. Comet Crawler's optional sacrifice, granting flying.
const TEXT =
  "Whenever this creature attacks, you may sacrifice another creature or artifact. If you do, this creature gains flying until end of turn.";

export default defineCard({
  name: "Kill-Zone Acrobat",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "artifact"] },
            exceptSource: true,
            text: "Sacrifice another creature or artifact",
          },
        ],
        ifDid: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
