import { defineCard } from "../define.js";

// EDHREC rank 14886.
//
// Rulings:
//   [2020-08-07] If the sacrificed creature was a Human, Falkenrath Aristocrat gains
//     indestructible and also gets a +1/+1 counter.
//   [2020-08-07] You can sacrifice Falkenrath Aristocrat to pay the cost of its own ability. It
//     won't receive a counter or gain indestructible.
//   [2020-08-07] The Human check reads the sacrificed creature as it last existed on the
//     battlefield (the `sacrificed` condition's last-known read).

const TEXT =
  "Sacrifice a creature: This creature gains indestructible until end of turn. If the sacrificed creature was a Human, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Falkenrath Aristocrat",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 4,
  toughness: 1,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { subtype: "Human" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
