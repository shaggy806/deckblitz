import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 26327. Martyr's Soul's intervening-if
// (rule 603.4: checked as it triggers and again as it resolves).
//
// Rulings:
//   [2021-03-19] If you control any tapped lands immediately after Nantuko Shaman enters the
//     battlefield, its ability doesn't trigger at all. If you control any tapped lands as the
//     ability resolves, you don't draw a card.

const TEXT = "When this creature enters, if you control no tapped lands, draw a card.";

export default defineCard({
  name: "Nantuko Shaman",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Shaman"],
  power: 3,
  toughness: 2,
  suspend: { n: 1, cost: "{2}{G}{G}" },
  text: `${TEXT}\nSuspend 1—{2}{G}{G} (Rather than cast this card from your hand, you may pay {2}{G}{G} and exile it with a time counter on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: true }, atLeast: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
