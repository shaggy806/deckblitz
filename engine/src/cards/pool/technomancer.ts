import { defineCard } from "../define.js";

// Rulings:
//   If a card in your graveyard has an {X} in its mana cost, X is zero.
//   The artifact creature cards you choose don't need to be cards that you milled.

const TEXT =
  "When this creature enters, mill three cards, then return any number of artifact creature cards with total mana value 6 or less from your graveyard to the battlefield.";
const ARTIFACT_CREATURE = { types: ["artifact", "creature"] } as const;

export default defineCard({
  name: "Technomancer",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron", "Wizard"],
  power: 5,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            // "Any number": as many as are there, the total mana value capping the choice.
            kind: "return-from-graveyard",
            filter: ARTIFACT_CREATURE,
            destination: "battlefield",
            count: { countInGraveyard: { ...ARTIFACT_CREATURE, ownedBy: "you" } },
            upTo: true,
            totalManaValueAtMost: 6,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
