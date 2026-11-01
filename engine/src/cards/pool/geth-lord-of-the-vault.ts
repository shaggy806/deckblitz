import { defineCard } from "../define.js";

// Rulings:
//   If a card in a player's graveyard has {X} in its mana cost, X is considered
//     to be 0.
//   The target card must have mana value exactly X. You can't overpay to have
//     the player mill more cards.
// "That player" is the card's owner, whoever controls it by then.

export default defineCard({
  name: "Geth, Lord of the Vault",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 5,
  toughness: 5,
  keywords: ["intimidate"],
  text:
    "Intimidate\n{X}{B}: Put target artifact or creature card with mana value X from an opponent's graveyard " +
    "onto the battlefield tapped under your control. Then that player mills X cards.",
  activated: [
    {
      cost: { mana: "{X}{B}", tap: false },
      resolve: null,
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "opponent",
          filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, underYourControl: true, enterTapped: true },
          { kind: "mill", target: { ownerOfTarget: 0 }, amount: "x" },
        ],
      },
      text:
        "{X}{B}: Put target artifact or creature card with mana value X from an opponent's graveyard onto the " +
        "battlefield tapped under your control. Then that player mills X cards.",
    },
  ],
});
