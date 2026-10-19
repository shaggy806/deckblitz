import { defineCard } from "../define.js";

// EDHREC rank 18182. The Brothers' War.

const ETB_TEXT =
  "When this creature enters, mill three cards. You may put a Plains card or a creature card with mana value 3 or less from among the cards milled this way into your hand. If you don't, put a +1/+1 counter on this creature.";
const COUNTER = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;
const MILLED = {
  thisWay: "milled",
  anyOf: [{ subtype: "Plains" }, { type: "creature", manaValue: { op: "lte", n: 3 } }],
} as const;

export default defineCard({
  name: "Airlift Chaplain",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Ainok Wayfarer's shape: "If you don't" is the `may`'s `else`; with no
      // milled Plains card or small creature card there is nothing to put
      // into your hand, so you don't.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 1, filter: MILLED },
            then: {
              kind: "may",
              prompt: "Put a Plains card or a creature card with mana value 3 or less from among the milled cards into your hand?",
              effect: {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 1,
                max: 1,
                destination: "hand",
                leftover: "stay",
                filter: MILLED,
              },
              else: COUNTER,
            },
            else: COUNTER,
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
