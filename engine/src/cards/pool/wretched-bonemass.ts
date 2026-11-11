import { defineCard } from "../define.js";

// Back face of Altar of the Wretched. The cards exiled as craft's materials
// stay linked to it while they stay exiled and it stays on the battlefield
// (rule 702.167c): its power and toughness are their total power (a
// characteristic-defining ability of one of them applies in exile, its
// ruling), and it has each listed keyword one of them has — every protection
// ability of theirs (rule 702.16a, Cairn Wanderer's ruling) and every
// "hexproof from" (702.11d-e). A token used to craft leaves nothing to read.
const PT_TEXT = "Wretched Bonemass's power and toughness are each equal to the total power of the exiled cards used to craft it.";
const KEYWORDS_TEXT =
  "This creature has flying as long as an exiled card used to craft it has flying. The same is true for first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, protection, reach, trample, and vigilance.";

export default defineCard({
  name: "Wretched Bonemass",
  art: "https://cards.scryfall.io/art_crop/back/e/2/e2c812bb-19f8-4a22-bda9-f2a6233cf700.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Horror"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${KEYWORDS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "sum", of: "power", filter: {}, in: "exiled-with-source" },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      sharesKeywords: {
        from: "exiled-with-source",
        keywords: [
          "flying",
          "first-strike",
          "double-strike",
          "deathtouch",
          "haste",
          "hexproof",
          "indestructible",
          "lifelink",
          "menace",
          "reach",
          "trample",
          "vigilance",
        ],
        protection: true,
      },
      text: KEYWORDS_TEXT,
    },
  ],
  faces: ["Altar of the Wretched", "Wretched Bonemass"],
  transform: true,
});
