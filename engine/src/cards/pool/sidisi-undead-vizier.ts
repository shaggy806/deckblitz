import { defineCard } from "../define.js";

// EDHREC rank 2843.
//
// Sidisi's Faithful's exploit shape: Sidisi may sacrifice itself, which still
// triggers its exploits ability (the ruling).

export default defineCard({
  name: "Sidisi, Undead Vizier",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Snake"],
  power: 4,
  toughness: 6,
  keywords: ["deathtouch"],
  text: "Deathtouch\nExploit (When this creature enters, you may sacrifice a creature.)\nWhen Sidisi exploits a creature, you may search your library for a card, put it into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: {
          kind: "sacrifice",
          who: "you",
          filter: { type: "creature" },
          count: 1,
          exploit: true,
        },
      },
      resolve: null,
      text: "Exploit",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card?",
        effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      },
      resolve: null,
      text: "When Sidisi exploits a creature, you may search your library for a card, put it into your hand, then shuffle.",
    },
  ],
});
