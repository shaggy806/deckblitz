import { defineCard } from "../define.js";

// EDHREC rank 12467.
//
// Rulings:
//   [2005-10-01] For example, a player controls three creatures when Concerted Effort's ability
//     resolves: one creature with flying and protection from red, one with islandwalk and
//     protection from green; and one with vigilance. All three creatures will have flying,
//     islandwalk, vigilance, protection from red, and protection from green until the end of the
//     turn.
//   [2005-10-01] Creatures keep all abilities granted this way until the end of the turn, even if
//     Concerted Effort or the original creature with that ability leaves the battlefield.
//   [2006-05-01] In Two-Headed Giant, triggers only once per upkeep, not once for each player.
//
// A `become` whose `sharesKeywords` reads every creature you control as the trigger resolves —
// the listed keywords, each landwalk (named or not) and each protection ability among them,
// granted ones too — and gives them to the creatures you control then (rule 611.2c), one
// timestamp, until end of turn.

const TEXT =
  "At the beginning of each upkeep, creatures you control gain flying until end of turn if a creature you control has flying. The same is true for fear, first strike, double strike, landwalk, protection, trample, and vigilance.";

export default defineCard({
  name: "Concerted Effort",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "become",
        filter: { type: "creature", controlledBy: "you" },
        duration: "end-of-turn",
        sharesKeywords: {
          from: { type: "creature", controlledBy: "you" },
          keywords: ["flying", "fear", "first-strike", "double-strike", "trample", "vigilance"],
          protection: true,
          landwalk: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
