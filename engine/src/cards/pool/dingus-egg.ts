import { defineCard } from "../define.js";

// EDHREC rank 15707. Any player's land, damage to the controller it last had on
// the battlefield.

const TEXT =
  "Whenever a land is put into a graveyard from the battlefield, this artifact deals 2 damage to that land's controller.";

export default defineCard({
  name: "Dingus Egg",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
