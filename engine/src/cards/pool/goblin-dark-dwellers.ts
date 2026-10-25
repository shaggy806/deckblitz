import { defineCard } from "../define.js";

// EDHREC rank 8968.
//
// The free cast is `cast-now` during the trigger's resolution (the rulings:
// a sorcery ignores its timing, an {X} is 0, and a card that can't or isn't
// cast stays in the graveyard); `exileAfter` exiles it instead of putting it
// into the graveyard, countered included.
const TEXT =
  "When this creature enters, you may cast target instant or sorcery card with mana value 3 or less from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Goblin Dark-Dwellers",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
