import { defineCard } from "../define.js";

// March of the Machine (MOM). X is the excess damage the 5 dealt
// (`excessDamageThisWay` — past lethal damage, or a planeswalker's loyalty, a
// battle's defense: rule 120.4a); the card exiled may be played this turn.
//
// Rulings:
//   [2023-04-14] Playing the exiled card follows the normal rules for playing that card. You must
//     pay its cost, and you must follow all applicable timing rules.
//   [2023-04-14] If you don't play the card, it will remain exiled.
//   [2023-04-14] Unless an effect allows you to play additional lands that turn, you can play an
//     exiled land card only if you haven't played a land yet that turn.

export default defineCard({
  name: "Nahiri's Warcrafting",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Nahiri's Warcrafting deals 5 damage to target creature, planeswalker, or battle. Look at the top X cards of your library, where X is the excess damage dealt this way. You may exile one of those cards. Put the rest on the bottom of your library in a random order. You may play the exiled card this turn.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker", "battle"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: { excessDamageThisWay: true },
        min: 0,
        max: 1,
        destination: "exile",
        unlinked: true,
        mayPlay: { duration: "end-of-turn", play: true },
        leftover: "bottom-random",
      },
    ],
  },
});
