import { defineCard } from "../define.js";

// Rulings:
//   [2021-02-05] If you’re casting a foretold card from exile for its foretell cost, you can’t
//     choose to cast it for any other alternative costs. You can, however, pay additional costs,
//     such as kicker costs. If the card has any mandatory additional costs, those must be paid to
//     cast the spell.
//   [2021-02-05] Because exiling a card with foretell from your hand is a special action, you can
//     do so any time you have priority during your turn, including in response to spells and
//     abilities. Once you announce you’re taking the action, no other player can respond by trying
//     to remove the card from your hand.
//   [2021-02-05] Creatures don’t necessarily have to be dealt lethal damage by Crush the Weak to
//     be exiled. After being dealt damage, if they would die for any reason that turn, they’ll be
//     exiled instead.
//   [2021-02-05] Casting a foretold card from exile follows the timing rules for that card. If you
//     foretell an instant card, you can cast it as soon as the next player’s turn. In most cases,
//     if you foretell a card that isn’t an instant (or doesn’t have flash), you’ll have to wait
//     until your next turn to cast it.

export default defineCard({
  name: "Crush the Weak",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Crush the Weak deals 2 damage to each creature. If a creature dealt damage this way would die this turn, exile it instead.\nForetell {R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{R}" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 2, filter: { type: "creature" } },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
