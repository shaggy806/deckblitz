import { defineCard } from "../define.js";

// EDHREC rank 10801. One anthem over the three types, so a creature that's
// more than one of them gets +1/+1 once (the ruling). The end-step ability
// needn't have seen the creature die (the ruling): it's turn-wide.
const LORD_TEXT = "Skeletons, Vampires, and Zombies you control get +1/+1.";
const END_TEXT =
  "At the beginning of your end step, if a creature died this turn, you may pay {1}. If you do, create a 1/1 black Skeleton creature token.";

export default defineCard({
  name: "Death-Priest of Myrkul",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Tiefling", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${LORD_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", subtypes: ["Skeleton", "Vampire", "Zombie"], controlledBy: "you" },
      },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a 1/1 Skeleton?",
        cost: "{1}",
        effect: { kind: "create-token", token: "Skeleton Token", count: 1 },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
