import { defineCard } from "../define.js";

// EDHREC rank 17128.
//
// One target; your opponents' other nonland permanents sharing its name (rule
// 201.2a) go with it, untargeted (`CardFilter.sameNameAsTarget`), all until
// this enchantment leaves (rule 610.3).

const TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls and all other nonland permanents your opponents control with the same name as that permanent until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Banishment",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: {
        kind: "exile-all",
        filter: { notTypes: ["land"], controlledBy: "opponent", sameNameAsTarget: 0 },
        untilSourceLeaves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
