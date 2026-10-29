import { defineCard } from "../define.js";

const I = "I — Create two 3/3 green Dinosaur creature tokens.";
const II = "II — This Saga gains \"Creatures you control have '{T}: Add {R}, {G}, or {W}.'\"";
const III = "III — Search your library for a Dinosaur card, reveal it, put it into your hand, then shuffle.";
const IV = "IV — Dinosaurs you control gain double strike and trample until end of turn.";
const dinosaurs = { type: "creature", subtype: "Dinosaur", controlledBy: "you" } as const;

// Chapter II has no duration: the Saga keeps the granted static for as long as
// it remains on the battlefield (the ruling) — gone with it after IV.
export default defineCard({
  name: "Roar of the Fifth People",
  art: "https://cards.scryfall.io/art_crop/back/5/7/57df2563-18d4-4526-a8bc-0c114e6fd4d9.jpg",
  colors: ["W", "R", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I}\n${II}\n${III}\n${IV}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "3/3 Dinosaur Token", count: 2 },
      resolve: null,
      text: I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "grant-static",
        target: "source",
        ability: {
          affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
          grantsActivated: [
            {
              cost: { mana: null, tap: true },
              targets: [],
              effect: { kind: "add-mana", mana: { oneOf: ["R", "G", "W"] }, amount: 1 },
              resolve: null,
              text: "{T}: Add {R}, {G}, or {W}.",
            },
          ],
          text: "Creatures you control have \"{T}: Add {R}, {G}, or {W}.\"",
        },
        duration: "permanent",
      },
      resolve: null,
      text: II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Dinosaur" }, destination: "hand", min: 0, max: 1, reveal: true },
      resolve: null,
      text: III,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: dinosaurs, keyword: "double-strike", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: dinosaurs, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: IV,
    },
  ],
  faces: ["Huatli, Poet of Unity", "Roar of the Fifth People"],
  transform: true,
});
