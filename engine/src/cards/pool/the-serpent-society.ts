import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 11265.
// Ward (rule 702.21a) whose cost is getting five poison counters (rule
// 122.1f): the targeting player gets them, or the spell or ability is
// countered. A player who can't get poison counters (Melira) can't pay it
// (rule 118.3). "With deathtouch" is read as the creature last existed on the
// battlefield (rule 603.10a).

export default defineCard({
  name: "The Serpent Society",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Snake", "Villain"],
  power: 3,
  toughness: 4,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWard—Get five poison counters. (A player with ten or more poison counters loses the game.)\nWhenever another creature you control with deathtouch dies, each opponent sacrifices a nontoken creature of their choice.",
  triggered: [
    ward({ poisonCounters: 5 }),
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", keyword: "deathtouch" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { token: false, type: "creature" }, count: 1 },
      resolve: null,
      text: "Whenever another creature you control with deathtouch dies, each opponent sacrifices a nontoken creature of their choice.",
    },
  ],
});
