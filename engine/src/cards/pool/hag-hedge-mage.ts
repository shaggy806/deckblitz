import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 29198.
//
// Rulings:
//   Each ability looks at your lands on its own (two dual lands can satisfy both); both are
//   optional, and a targeted one needs a target even if you won't use it. Each has an
//   intervening "if" (rule 603.4): checked as the creature enters and again on resolution.

export default defineCard({
  name: "Hag Hedge-Mage",
  manaCost: "{2}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Hag", "Shaman"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, if you control two or more Swamps, you may have target player discard a card.\nWhen this creature enters, if you control two or more Forests, you may put target card from your graveyard on top of your library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 2 },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have target player discard a card?",
        effect: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: "When this creature enters, if you control two or more Swamps, you may have target player discard a card.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 2 },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
      effect: {
        kind: "may",
        prompt: "Put target card from your graveyard on top of your library?",
        effect: { kind: "put-on-library", target: 0, position: "top" },
      },
      resolve: null,
      text: "When this creature enters, if you control two or more Forests, you may put target card from your graveyard on top of your library.",
    },
  ],
});
