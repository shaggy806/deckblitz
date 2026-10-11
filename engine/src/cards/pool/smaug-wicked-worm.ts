import { defineCard } from "../define.js";

// X is counted as the trigger resolves. The cast trigger is Mastermind
// Plum's: an intervening if on the mana spent (`manaFrom`), read off the
// spell's own payment.
const ETB_TEXT =
  "When Smaug enters, create X tapped Treasure tokens, where X is the number of artifacts your opponents control.";
const CAST_TEXT =
  "Whenever you cast a spell, if mana from a Treasure was spent to cast it, you draw a card and lose 1 life.";

export default defineCard({
  name: "Smaug, Wicked Worm",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { countOf: { type: "artifact", controlledBy: "opponent" } },
        tapped: true,
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaFrom: { subtype: "Treasure" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
