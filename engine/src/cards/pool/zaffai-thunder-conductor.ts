import { defineCard } from "../define.js";

// EDHREC rank 11483. Commander 2021.
//
// "That spell" is the one that triggered magecraft (the trigger object), not
// the card scried (its ruling) — its mana value on the stack, {X} as chosen,
// or as it last was there if it's gone. A copy triggers it too. Both "if"s
// are checked as the ability resolves, after the scry; a spell of 10 or more
// does both. The opponent is chosen at random as it resolves, not targeted.
const TEXT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, scry 1. If that spell's mana value is 5 or greater, create a 4/4 blue and red Elemental creature token. If that spell's mana value is 10 or greater, Zaffai deals 10 damage to an opponent chosen at random.";

export default defineCard({
  name: "Zaffai, Thunder Conductor",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaValue: { op: "gte", n: 5 } } },
            then: { kind: "create-token", token: "4/4 Blue Red Elemental Token", count: 1 },
          },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaValue: { op: "gte", n: 10 } } },
            then: {
              kind: "choose-opponent",
              random: true,
              then: { kind: "damage", amount: 10, who: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
