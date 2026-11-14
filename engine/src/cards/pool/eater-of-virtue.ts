import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9503.
//
// Rulings:
//   If Eater of Virtue leaves the battlefield and returns to the battlefield, it will be a new
//   object with no association to any cards it exiled from any previous times it was on the
//   battlefield.
//   The equipped creature gains any hexproof and protection abilities of cards exiled with Eater
//   of Virtue.
//
// The dead creature's card is exiled with this Equipment (`linked`, rule 607.2a), and the
// equipped creature has each listed keyword a card exiled with it has (`sharesKeywords` from
// `"exiled-with-source"`, scope `"attached"`), every protection ability (rule 702.16a) and every
// "hexproof from" (702.11d) of theirs among them. A token that died leaves no card to exile.

const DIES_TEXT = "Whenever equipped creature dies, exile it.";
const PT_TEXT = "Equipped creature gets +2/+0.";
const KEYWORDS_TEXT =
  "As long as a card exiled with Eater of Virtue has flying, equipped creature has flying. The same is true for first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, protection, reach, trample, and vigilance.";

export default defineCard({
  name: "Eater of Virtue",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${DIES_TEXT}\n${PT_TEXT}\n${KEYWORDS_TEXT}\nEquip {1}`,
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", linked: true },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 0], text: PT_TEXT },
    {
      affects: { scope: "attached" },
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
  activated: [equip("{1}")],
});
