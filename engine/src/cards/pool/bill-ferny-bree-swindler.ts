import { defineCard } from "../define.js";

const BLOCKED = "Whenever Bill Ferny becomes blocked, choose one —";

// Once however many creatures block it (its ruling). "If they do": only once
// the Horse has changed hands this way; removed from combat it stays tapped.
export default defineCard({
  name: "Bill Ferny, Bree Swindler",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: `${BLOCKED}\n• Create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")\n• Target opponent gains control of target Horse you control. If they do, remove Bill Ferny from combat and create three Treasure tokens.`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Create a Treasure token.", effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
          {
            text: "Target opponent gains control of target Horse you control. If they do, remove Bill Ferny from combat and create three Treasure tokens.",
            targets: ["opponent", { kind: "permanent", whose: "you", filter: { subtype: "Horse" } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-control", target: 1, who: { target: 0 }, untilEndOfTurn: false },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "gained-control" },
                  then: {
                    kind: "sequence",
                    effects: [
                      { kind: "remove-from-combat", target: "source" },
                      { kind: "create-token", token: "Treasure Token", count: 3 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: BLOCKED,
    },
  ],
});
