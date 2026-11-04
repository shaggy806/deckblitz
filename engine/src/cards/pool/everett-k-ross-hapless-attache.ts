import { defineCard } from "../define.js";

export default defineCard({
  name: "Everett K. Ross, Hapless Attaché",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 3,
  text: "Commander creatures you control get +1/+1 and have lifelink.\nWhenever an opponent attacks you with two or more creatures, draw a card.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, controlledBy: "you" } },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: "Commander creatures you control get +1/+1 and have lifelink.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "opponent", atLeast: 2, attackingYouDirectly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever an opponent attacks you with two or more creatures, draw a card.",
    },
  ],
});
