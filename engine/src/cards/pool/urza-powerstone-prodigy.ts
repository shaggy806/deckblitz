import { defineCard } from "../define.js";

// EDHREC rank 12517.
//
// Rulings:
//   Entering tapped isn't part of a Powerstone token's definition: the token is created tapped.
//   You can use the {C} added by a Powerstone token on anything that isn't a nonartifact spell.
//
// "Whenever you discard one or more artifact cards" is one `discards` trigger per discard event,
// narrowed to artifact cards (Dying to Serve's shape with a filter), at most once each turn.

const LOOT_TEXT = "{1}, {T}: Draw a card, then discard a card.";
const DISCARD_TEXT =
  "Whenever you discard one or more artifact cards, create a tapped Powerstone token. This ability triggers only once each turn.";

export default defineCard({
  name: "Urza, Powerstone Prodigy",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 3,
  keywords: ["vigilance"],
  text:
    `Vigilance\n${LOOT_TEXT}\n${DISCARD_TEXT} ` +
    "(The token is an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
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
  ],
  triggered: [
    {
      trigger: { on: "discards", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      oncePerTurn: true,
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
