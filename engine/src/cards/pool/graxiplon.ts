import { defineCard } from "../define.js";

// Three of the defending player's creatures with one creature type in
// common, a changeling counting for every type.
const EVASION =
  "This creature can't be blocked unless defending player controls three or more creatures that share a creature type.";

export default defineCard({
  name: "Graxiplon",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  text: EVASION,
  static: [
    {
      affects: { scope: "self" },
      // The `not` inside: nobody is the defending player while it isn't
      // attacking, and then it isn't unblockable either.
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: {
          kind: "not",
          of: { kind: "controls", filter: { type: "creature" }, atLeast: 3, sharingACreatureType: true },
        },
      },
      grantKeywords: ["unblockable"],
      text: EVASION,
    },
  ],
});
