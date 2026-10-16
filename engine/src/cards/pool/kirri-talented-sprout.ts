import { defineCard } from "../define.js";

// EDHREC rank 12325.
//
// One filter for "Plants and Treefolk", so a creature that's both gets +2/+0
// once (the ruling). The trigger fires at the start of each of your
// postcombat main phases — an extra combat's too.
const LORD_TEXT = "Other Plants and Treefolk you control get +2/+0.";
const RETURN_TEXT =
  "At the beginning of each of your postcombat main phases, return target Plant, Treefolk, or land card from your graveyard to your hand.";

export default defineCard({
  name: "Kirri, Talented Sprout",
  manaCost: "{1}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Plant", "Druid"],
  power: 0,
  toughness: 3,
  text: `${LORD_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you", subtypes: ["Plant", "Treefolk"] }, excludeSelf: true },
      grantPt: [2, 0],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { anyOf: [{ subtypes: ["Plant", "Treefolk"] }, { type: "land" }] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
