import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// Morningtide. Champion (rule 702.72): the `champion` helper, over either type.

export default defineCard({
  name: "Unstoppable Ash",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nChampion a Treefolk or Warrior (When this enters, sacrifice it unless you exile another Treefolk or Warrior you control. When this leaves the battlefield, that card returns to the battlefield.)\nWhenever a creature you control becomes blocked, it gets +0/+5 until end of turn.",
  triggered: [
    ...champion({ subtypes: ["Treefolk", "Warrior"] }, "a Treefolk or Warrior"),
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 0, toughness: 5, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature you control becomes blocked, it gets +0/+5 until end of turn.",
    },
  ],
});
