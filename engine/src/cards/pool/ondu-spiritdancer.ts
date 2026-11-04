import { defineCard } from "../define.js";

// EDHREC rank 1656.
//
// "Do this only once each turn" limits the copying, not the trigger (`may`'s
// `oncePerTurn`): declining leaves it for a later enchantment that turn, and
// once a token is made, the token's own entry and any other instance on the
// stack offer nothing (the rulings). An Aura's token chooses what it enchants as
// it enters, not targeting (rule 303.4f).
const TEXT =
  "Whenever an enchantment you control enters, you may create a token that's a copy of it. Do this only once each turn.";

export default defineCard({
  name: "Ondu Spiritdancer",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a token that's a copy of that enchantment?",
        oncePerTurn: true,
        effect: { kind: "create-token-copy", of: "trigger-object", count: 1, who: "you" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
