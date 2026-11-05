import { defineCard } from "../define.js";

// EDHREC rank 25879. The revealed card stays in your hand. A face-down
// Ambusher that blocks has no blocks trigger to fire (its ruling).
const BLOCK_TEXT = "Whenever this creature blocks, it deals 1 damage to you.";
const UP_TEXT = "When this creature is turned face up, target creature can't block this turn.";

export default defineCard({
  name: "Horde Ambusher",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 2,
  morph: {
    keyword: "morph",
    cost: "",
    also: { reveal: { count: 1, filter: { colors: ["R"] }, text: "red card" } },
    text: "Reveal a red card in your hand",
  },
  text: `${BLOCK_TEXT}\nMorph—Reveal a red card in your hand. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: BLOCK_TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
