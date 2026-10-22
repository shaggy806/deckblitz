import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 26335.
//
// Rulings:
//   [2004-10-04] Whether it does 1 or 2 damage is checked on resolution.
//
// The snow Swamp is checked as the ability resolves (a `conditional`), and the
// damage to every creature and player is one event (Dry Spell's shape).

const TEXT =
  "{T}, Sacrifice this creature: This creature deals 1 damage to each creature and each player. If you control a snow Swamp, this creature deals 2 damage to each creature and each player instead.";

const blast = (amount: number) =>
  ({
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount },
      { kind: "damage", amount, who: "each-player" },
    ],
  }) as const;

export default defineCard({
  name: "Gangrenous Zombies",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { type: "land", supertype: "snow", subtype: "Swamp", controlledBy: "you" },
          atLeast: 1,
        },
        then: blast(2),
        else: blast(1),
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
