import { defineCard } from "../define.js";

// EDHREC rank 5515. "If a graveyard has twenty or more cards in it" is any
// graveyard, read after the mill (its ruling).

export default defineCard({
  name: "Jace, the Perfected Mind",
  manaCost: "{2}{U}{U/P}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 5,
  compleated: true,
  text: "Compleated ({U/P} can be paid with {U} or 2 life. If life was paid, this planeswalker enters with two fewer loyalty counters.)\n+1: Until your next turn, up to one target creature gets -3/-0.\n−2: Target player mills three cards. Then if a graveyard has twenty or more cards in it, you draw three cards. Otherwise, you draw a card.\n−X: Target player mills three times X cards.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "until-your-next-turn" },
      resolve: null,
      text: "+1: Until your next turn, up to one target creature gets -3/-0.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", whose: "any-player", atLeast: 20 },
            then: { kind: "draw", amount: 3 },
            else: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "−2: Target player mills three cards. Then if a graveyard has twenty or more cards in it, you draw three cards. Otherwise, you draw a card.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { product: ["x", 3] } },
      resolve: null,
      text: "−X: Target player mills three times X cards.",
    },
  ],
});
