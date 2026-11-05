import { defineCard } from "../define.js";

// EDHREC rank 15885.

export default defineCard({
  name: "Shaun & Rebecca, Agents",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Scientist"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen Shaun & Rebecca enters, search your graveyard, hand, and library for a card named The Animus and put it onto the battlefield, then shuffle.\n{T}: Add {C}. When you do, mill two cards.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        also: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "mill", target: "you", amount: 2 },
          text: "When you do, mill two cards.",
        },
      },
      resolve: null,
      text: "{T}: Add {C}. When you do, mill two cards.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        zones: "graveyard-hand-library",
        filter: { name: "The Animus" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: "When Shaun & Rebecca enters, search your graveyard, hand, and library for a card named The Animus and put it onto the battlefield, then shuffle.",
    },
  ],
});
