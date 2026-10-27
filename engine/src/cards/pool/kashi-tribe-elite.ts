import { defineCard } from "../define.js";

// EDHREC rank 19054.

export default defineCard({
  name: "Kashi-Tribe Elite",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 2,
  toughness: 3,
  text: "Legendary Snakes you control have shroud. (They can't be the targets of spells or abilities.)\nWhenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Snake", supertype: "legendary", controlledBy: "you" } },
      grantKeywords: ["shroud"],
      text: "Legendary Snakes you control have shroud. (They can't be the targets of spells or abilities.)",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
    },
  ],
});
