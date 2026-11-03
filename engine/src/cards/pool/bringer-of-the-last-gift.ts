import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, if you cast it, each player sacrifices all other creatures they control. Then each player returns all creature cards from their graveyard that weren't put there this way to the battlefield.";

export default defineCard({
  name: "Bringer of the Last Gift",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-all", who: "each-player", filter: { type: "creature", isSource: false } },
          {
            kind: "return-from-graveyard",
            from: "each-graveyard",
            filter: { type: "creature", notThisWay: "sacrificed" },
            destination: "battlefield",
            count: "all",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
