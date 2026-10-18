import { defineCard } from "../define.js";

// The graveyard target is Court of Ardenvale's `card-in-graveyard` shape.

const ENTER_TEXT =
  "When this creature enters, return target creature card with mana value 3 or less from your graveyard to your hand.";

export default defineCard({
  name: "Nimraiser Paladin",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 4,
  toughness: 4,
  toxic: 2,
  text: `Toxic 2 (Players dealt combat damage by this creature also get two poison counters.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
