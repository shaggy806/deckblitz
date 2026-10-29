import { defineCard } from "../define.js";

// EDHREC rank 7318.
// Lands exiled on the way stay exiled; the process stops at a nonland card of mana value 3 or less,
// or when no nonland card is found (the rulings). The damage is one event, 1 for each card put into
// your hand over every pass.

const ETB_TEXT =
  "When Demonlord Belzenlok enters, exile cards from the top of your library until you exile a nonland card, then put that card into your hand. If the card's mana value is 4 or greater, repeat this process. Demonlord Belzenlok deals 1 damage to you for each card put into your hand this way.";

export default defineCard({
  name: "Demonlord Belzenlok",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "repeat",
            again: { kind: "this-way", what: "returned-to-hand", filter: { manaValue: { op: "gte", n: 4 } } },
            effect: {
              kind: "reveal-until",
              filter: { notTypes: ["land"] },
              exile: true,
              rest: "stay",
              then: { kind: "return-to-hand", target: 0, from: "exile" },
            },
          },
          { kind: "damage", amount: { thisWay: "returned-to-hand" }, who: "you" },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
