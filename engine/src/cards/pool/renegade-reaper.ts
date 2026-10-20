import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 12347.
const TEXT = "When this creature enters, mill four cards. If at least one Angel card is milled this way, you gain 4 life.";

export default defineCard({
  name: "Renegade Reaper",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Angel", "Berserker"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { subtype: "Angel" } },
            then: { kind: "gain-life", amount: 4 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
