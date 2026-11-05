import { defineCard } from "../define.js";

// Will of the council (rule 701.38): a tie is condemnation.

const TEXT =
  "Will of the council — When this creature enters, starting with you, each player votes for grace or condemnation. If grace gets more votes, each player returns each creature card from their graveyard to the battlefield. If condemnation gets more votes or the vote is tied, destroy all creatures other than this creature.";

export default defineCard({
  name: "Magister of Worth",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["grace", "condemnation"] } },
          {
            kind: "conditional",
            condition: { kind: "vote-won", option: 0 },
            then: {
              kind: "return-from-graveyard",
              from: "each-graveyard",
              filter: { type: "creature" },
              destination: "battlefield",
              count: "all",
            },
            else: { kind: "destroy-all", filter: { type: "creature" }, exceptSource: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
