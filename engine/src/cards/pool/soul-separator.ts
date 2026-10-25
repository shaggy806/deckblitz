import { defineCard } from "../define.js";

const TEXT =
  "{5}, {T}, Sacrifice this artifact: Exile target creature card from your graveyard. Create a token that's a copy of that card, except it's 1/1, it's a Spirit in addition to its other types, and it has flying. Create a black Zombie creature token with power equal to that card's power and toughness equal to that card's toughness.";

// The Spirit enters before the Zombie (the ruling). The Zombie's size is read
// once, off the exiled card (a characteristic-defining ability counts; a
// static bonus that applied only in the graveyard doesn't — the rulings).
export default defineCard({
  name: "Soul Separator",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            exceptions: { basePt: [1, 1], addSubtypes: ["Spirit"], keywords: ["flying"] },
          },
          {
            kind: "create-token",
            token: "Zombie Token (Black 0/0)",
            count: 1,
            basePt: { power: { powerOf: 0 }, toughness: { toughnessOf: 0 } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
