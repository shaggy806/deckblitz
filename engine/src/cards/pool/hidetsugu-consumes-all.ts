import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty. EDHREC rank 14554.
// Chapter III is Azusa's Many Journeys': it comes back as Vessel of the
// All-Consuming, a new object that's no Saga. A single-faced copy of it stays
// in exile (the ruling, rule 712.14a).

const CHAPTER_I = "I — Destroy each nonland permanent with mana value 1 or less.";
const CHAPTER_II = "II — Exile all graveyards.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Hidetsugu Consumes All",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Hidetsugu Consumes All", "Vessel of the All-Consuming"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "destroy-all", filter: { notTypes: ["land"], manaValue: { op: "lte", n: 1 } } },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "exile-graveyard", target: "each-player" },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
