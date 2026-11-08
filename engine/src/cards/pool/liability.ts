import { defineCard } from "../define.js";

const TEXT = "Whenever a nontoken permanent is put into a player's graveyard from the battlefield, that player loses 1 life.";

export default defineCard({
  name: "Liability",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { token: false }, to: ["graveyard"] },
      targets: [],
      resolve: null,
      effect: { kind: "lose-life", amount: 1, who: { ownerOf: "trigger-object" } },
      text: TEXT,
    },
  ],
});
