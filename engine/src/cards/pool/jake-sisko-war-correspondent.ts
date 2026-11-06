import { defineCard } from "../define.js";

// EDHREC rank 30479.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you gain 1 life. If this is the second time this ability has resolved this turn, investigate.";

export default defineCard({
  name: "Jake Sisko, War Correspondent",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: `${LANDFALL_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 2 },
            then: { kind: "create-token", token: "Clue Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
