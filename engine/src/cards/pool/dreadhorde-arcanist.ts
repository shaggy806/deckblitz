import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may cast target instant or sorcery card with mana value less than or equal to this creature's power from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

// The mana value cap reads this creature's power as the target is chosen and
// again as the ability resolves — as it last existed, if it has left (the
// rulings).
export default defineCard({
  name: "Dreadhorde Arcanist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["instant", "sorcery"],
            manaValue: { op: "lte", n: { amount: { powerOf: "source" } } },
          },
        },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
