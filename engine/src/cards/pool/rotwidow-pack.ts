import { defineCard } from "../define.js";

// EDHREC rank 9373.

const TEXT =
  "{3}{B}{G}, Exile a creature card from your graveyard: Create a 1/2 green Spider creature token with reach, then each opponent loses 1 life for each Spider you control.";

export default defineCard({
  name: "Rotwidow Pack",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}{G}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "1/2 Green Spider Token (Reach)", count: 1 },
          {
            kind: "lose-life",
            who: "each-opponent",
            amount: { countOf: { subtype: "Spider", controlledBy: "you" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
