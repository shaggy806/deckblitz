import { defineCard } from "../define.js";

// Theros Beyond Death (THB). EDHREC rank 15023.
//
// Rulings:
//   If a creature gains one of the listed abilities before Majestic Myriarch's triggered ability
//     resolves, perhaps due to another ability that triggered at the beginning of combat,
//     Majestic Myriarch will gain that ability.
//   Majestic Myriarch's second ability triggers at the beginning of each combat, not just combat
//     on your turn, whether or not any creatures you control have any of the listed abilities.
//   Majestic Myriarch's first ability applies in all zones. While it's on the battlefield, it
//     counts itself, so it'll be at least 2/2.
//   Which abilities Majestic Myriarch gains is determined as the ability resolves. They won't
//     change even if every other creature that has the abilities leaves the battlefield or if
//     creatures enter the battlefield or gain abilities.
//   Multiple instances of any of the abilities Majestic Myriarch can gain are redundant.
//   If one of those creatures has one or more variants of the listed keywords (for example,
//     hexproof from white), this creature gains those specific variants.
//
// The P/T is a characteristic-defining ability (rule 604.3), counting itself. The combat
// trigger is a `become` of this creature with `sharesKeywords` over the creatures you control:
// read once as it resolves (rule 608.2h), each listed keyword one of them has, and with
// "hexproof" listed each "hexproof from [quality]" among them as itself (rule 702.11d-e).
const PT_TEXT = "Majestic Myriarch's power and toughness are each equal to twice the number of creatures you control.";
const COMBAT_TEXT =
  "At the beginning of each combat, this creature gains flying until end of turn if you control a creature with flying. The same is true for first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, reach, trample, and vigilance.";

export default defineCard({
  name: "Majestic Myriarch",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        // Twice the count: the same count, twice (Masumaro, First to Live).
        countOf: { sum: [{ countOf: { type: "creature", controlledBy: "you" } }, { countOf: { type: "creature", controlledBy: "you" } }] },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        duration: "end-of-turn",
        sharesKeywords: {
          from: { type: "creature", controlledBy: "you" },
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
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
