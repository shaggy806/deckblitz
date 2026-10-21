import { defineCard } from "../define.js";

// EDHREC rank 24959. Vampire Gourmand's shape, without the draw.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature. If you do, this creature can't be blocked this turn.";

export default defineCard({
  name: "Bloodmist Infiltrator",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
