import { defineCard } from "../define.js";

// EDHREC rank 2075.
//
// The copy has no duration (rule 611.2a). It copies exactly what's printed on
// the card — nothing about the permanent it was before it reached the
// graveyard; an {X} in its cost is 0 — with flying and this ability as
// copiable exceptions (rule 707.9a-b). The Looter keeps its counters and the
// effects on it, and enters nothing, so no "enters" ability of the card
// applies (rule 707.4, the rulings). A "once each turn" ability of the card
// copied again is a new one.
const LOOT_TEXT = "{T}: Draw a card, then discard a card.";
const COPY_TEXT =
  "{X}: This creature becomes a copy of target creature card in your graveyard with mana value X, except it has flying and this ability. Activate only as a sorcery.";

export default defineCard({
  name: "Likeness Looter",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Shapeshifter"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${LOOT_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      cost: { mana: "{X}", tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        exceptions: { keywords: ["flying"], thisAbility: { card: "Likeness Looter", activated: 1 } },
      },
      resolve: null,
      text: COPY_TEXT,
      sorcerySpeed: true,
    },
  ],
});
