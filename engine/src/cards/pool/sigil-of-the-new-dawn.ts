import { defineCard } from "../define.js";

export default defineCard({
  name: "Sigil of the New Dawn",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a creature is put into your graveyard from the battlefield, you may pay {1}{W}. If you do, return that card to your hand.",
  triggered: [
    {
      // A creature you own, whoever controlled it (the ruling).
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "you" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} to return that card to your hand?",
        cost: "{1}{W}",
        effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      },
      resolve: null,
      text: "Whenever a creature is put into your graveyard from the battlefield, you may pay {1}{W}. If you do, return that card to your hand.",
    },
  ],
});
