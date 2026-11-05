import { defineCard } from "../define.js";

const LORD_TEXT =
  "Each Skeleton you control has trample, attacks each combat if able, and gets +X/+0, where X is the number of other Skeletons you control.";
const TOKEN_TEXT =
  "At the beginning of your end step, create a tapped 1/1 black Skeleton creature token. If a creature died this turn, create two of those tokens instead.";

export default defineCard({
  name: "Skeletal Swarming",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  text: `${LORD_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Skeleton", controlledBy: "you" } },
      grantKeywords: ["trample"],
      restrictions: ["must-attack"],
      grantPtPerCount: {
        filter: { subtype: "Skeleton", controlledBy: "you" },
        relativeToAffected: true,
        excludeSelf: true,
        pt: [1, 0],
      },
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Skeleton Token",
        count: { ifCondition: { kind: "creature-died-this-turn" }, then: 2, else: 1 },
        tapped: true,
      },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
