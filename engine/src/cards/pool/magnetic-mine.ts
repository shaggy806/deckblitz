import { defineCard } from "../define.js";

const TEXT =
  "Whenever another artifact is put into a graveyard from the battlefield, this artifact deals 2 damage to that artifact's controller.";

// "That artifact's controller" is the dying artifact's controller as it last
// existed on the battlefield (`trigger-controller`). It doesn't see itself
// die, but does see another artifact going to the graveyard at the same time
// (the ruling: leaves-the-battlefield abilities look back, rule 603.10a).
export default defineCard({
  name: "Magnetic Mine",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "artifact" }, otherOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
