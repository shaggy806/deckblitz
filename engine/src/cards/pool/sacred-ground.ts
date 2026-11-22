import { defineCard } from "../define.js";

const TEXT =
  "Whenever a spell or ability an opponent controls causes a land to be put into your graveyard from the battlefield, return that card to the battlefield.";

// "Your graveyard" is the land's owner's, whoever controlled it; "a spell or
// ability an opponent controls" is a destroy, an edict's sacrifice or any
// other effect of one an opponent controls — never lethal damage's
// state-based action or a cost. The card comes back under its owner's
// control (rule 110.2), and only from the graveyard it went to (rule 400.7).
export default defineCard({
  name: "Sacred Ground",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "any",
        to: ["graveyard"],
        filter: { type: "land", ownedBy: "you" },
        byEffectOf: "opponent",
      },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
