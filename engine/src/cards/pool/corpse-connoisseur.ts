import { defineCard } from "../define.js";

// EDHREC rank 9114.
// The search is optional ("you may search"), and a search of a hidden zone for
// a quality may find nothing (rule 701.19b), so it's `min: 0` inside the `may`.

const ETB = "When this creature enters, you may search your library for a creature card, put that card into your graveyard, then shuffle.";

export default defineCard({
  name: "Corpse Connoisseur",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${ETB}\nUnearth {3}{B} ({3}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", exileIfItWouldLeave: true },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "exile", target: "source" },
            text: "Exile the unearthed card.",
          },
        ],
      },
      resolve: null,
      text: "Unearth {3}{B}",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a creature card and put it into your graveyard?",
        effect: { kind: "search-library", filter: { type: "creature" }, destination: "graveyard", min: 0, max: 1 },
      },
      resolve: null,
      text: ETB,
    },
  ],
});
