import { defineCard } from "../define.js";

// EDHREC rank 6835. Assassin's Creed.
//
// "The exiled card" is the one chapter I exiled, linked to this Saga (rule
// 607.2a — look-and-choose's `"exile"` destination). Each chapter ability
// remembers the Saga as it triggered (its source stint), so a Saga bounced
// in response to II or III still finds it: II puts counters equal to its
// mana value (an {X} counting 0, the ruling) and III returns it.
//
// Rulings:
//   If a card in exile has {X} in its mana cost, X is 0 for the purpose of determining its mana
//   value.

const PERMANENT_CARD = { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] } as const;

const I_TEXT = "I — Exile a permanent card from your graveyard. You gain life equal to its mana value.";
const II_TEXT =
  "II — Put a number of +1/+1 counters on target creature you control equal to the mana value of the exiled card.";
const III_TEXT = "III — Return this Saga and the exiled card to their owner's hand.";

export default defineCard({
  name: "The Aesir Escape Valhalla",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "graveyard",
            filter: PERMANENT_CARD,
            min: 1,
            max: 1,
            destination: "exile",
            leftover: "stay",
          },
          { kind: "gain-life", amount: { exiledWithSourceManaValue: true } },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { exiledWithSourceManaValue: true } },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-exiled-by-source", linked: "hand" },
          { kind: "return-to-hand", target: "source" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
