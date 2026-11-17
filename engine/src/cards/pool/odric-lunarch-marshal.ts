import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of each combat, creatures you control gain first strike until end of turn if " +
  "a creature you control has first strike. The same is true for flying, deathtouch, double " +
  "strike, haste, hexproof, indestructible, lifelink, menace, reach, skulk, trample, and vigilance.";

// Each keyword is asked on resolution (the rulings), and the creatures that
// gain it are the ones there then: a `become` whose `sharesKeywords` reads the
// creatures you control once, one effect and one timestamp (rule 613.7b). A
// "hexproof from [quality]" is a hexproof ability (702.11d-e), shared as itself
// (Bleeding Effect's ruling on the same wording).

export default defineCard({
  name: "Odric, Lunarch Marshal",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "become",
        filter: { type: "creature", controlledBy: "you" },
        duration: "end-of-turn",
        sharesKeywords: {
          from: { type: "creature", controlledBy: "you" },
          keywords: [
            "first-strike",
            "flying",
            "deathtouch",
            "double-strike",
            "haste",
            "hexproof",
            "indestructible",
            "lifelink",
            "menace",
            "reach",
            "skulk",
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
