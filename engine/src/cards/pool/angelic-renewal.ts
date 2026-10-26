import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature is put into your graveyard from the battlefield, you may sacrifice this enchantment. If you do, return that card to the battlefield.";

export default defineCard({
  name: "Angelic Renewal",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      // "Your graveyard": a creature you own, whoever controlled it (the
      // rulings). Several at once trigger several times, but only the first
      // to resolve can sacrifice it: `sacrifice-source`'s `then` runs only
      // when the sacrifice happened.
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "you" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Angelic Renewal to return that card to the battlefield?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "put-onto-battlefield", target: "trigger-object" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
