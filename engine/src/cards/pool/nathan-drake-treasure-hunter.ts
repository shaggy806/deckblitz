import { defineCard } from "../define.js";

// EDHREC rank 14438. The two halves of the spending rule are two statics, each
// narrowed to its own payments; the attack trigger offers one spell, paid for.

export default defineCard({
  name: "Nathan Drake, Treasure Hunter",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nYou may spend mana as though it were mana of any color to cast spells you don't own or to activate abilities of permanents you control but don't own.\nWhenever Nathan Drake attacks, exile the top card of each player's library. You may cast a spell from among those cards.",
  static: [
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", spell: { ownedBy: "opponent" } },
      text: "You may spend mana as though it were mana of any color to cast spells you don't own.",
    },
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", activatingOf: { controlledBy: "you", ownedBy: "opponent" } },
      text: "You may spend mana as though it were mana of any color to activate abilities of permanents you control but don't own.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "each-player", amount: 1 },
          { kind: "cast-now", from: "exiled-this-way" },
        ],
      },
      resolve: null,
      text: "Whenever Nathan Drake attacks, exile the top card of each player's library. You may cast a spell from among those cards.",
    },
  ],
});
