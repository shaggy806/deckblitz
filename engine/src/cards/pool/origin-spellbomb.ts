import { defineCard } from "../define.js";

// EDHREC rank 18523.
export default defineCard({
  name: "Origin Spellbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text:
    "{1}, {T}, Sacrifice this artifact: Create a 1/1 colorless Myr artifact creature token.\n" +
    "When this artifact is put into a graveyard from the battlefield, you may pay {W}. If you do, draw a card.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Myr Token", count: 1 },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: Create a 1/1 colorless Myr artifact creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Pay {W} to draw a card?", cost: "{W}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "When this artifact is put into a graveyard from the battlefield, you may pay {W}. If you do, draw a card.",
    },
  ],
});
