import { defineCard } from "../define.js";

// EDHREC rank 10910.
//
// Rulings:
//   [2019-08-23] The “commander tax” increases based on how many times a commander was cast from
//     the command zone. Casting a commander from your hand doesn’t require that additional cost,
//     and it doesn’t increase what the cost will be the next time you cast that commander from the
//     command zone.
//   [2019-08-23] Certain cards in other sets with the partner keyword may allow you to have more
//     than one commander. If you have two commanders in the command zone, Road of Return’s second
//     mode puts one of your choice into your hand, not both.
//   [2019-08-23] If your commander isn’t in the command zone (or if you’re not playing the
//     Commander variant), Road of Return’s second mode does nothing.

export default defineCard({
  name: "Road of Return",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• Return target permanent card from your graveyard to your hand.\n• Put your commander into your hand from the command zone.\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Return target permanent card from your graveyard to your hand.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
          },
        ],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Put your commander into your hand from the command zone.",
        effect: { kind: "look-and-choose", zone: "command", min: 1, max: 1, destination: "hand", leftover: "stay" },
      },
    ],
  },
});
