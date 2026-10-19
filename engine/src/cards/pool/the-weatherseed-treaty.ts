import { defineCard } from "../define.js";

// Read ahead (rule 702.155): its controller picks chapter I, II or III as it
// enters, it enters with that many lore counters, and the chapters before the
// one picked never trigger. Chapter III's X is domain's count as it resolves.

const CHAPTER_I = "I — Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";
const CHAPTER_II = "II — Create a 1/1 green Saproling creature token.";
const CHAPTER_III =
  "III — Domain — Target creature you control gets +X/+X and gains trample until end of turn, where X is the number of basic land types among lands you control.";

export default defineCard({
  name: "The Weatherseed Treaty",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters don't trigger. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  readAhead: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: 0,
            power: { basicLandTypes: "you" },
            toughness: { basicLandTypes: "you" },
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
