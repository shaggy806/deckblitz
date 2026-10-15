import { defineCard } from "../define.js";

// EDHREC rank 12934. Makes Darkstar — a named legendary token (Mowu's shape).

const ATTACK_TEXT =
  "Whenever Rufus Shinra attacks, if you don't control a creature named Darkstar, create Darkstar, a legendary 2/2 white and black Dog creature token.";

export default defineCard({
  name: "Rufus Shinra",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      // An intervening-if (rule 603.4): checked as it triggers and again as
      // it resolves.
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { type: "creature", name: "Darkstar" }, atLeast: 1 },
      },
      targets: [],
      effect: { kind: "create-token", token: "Darkstar", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
