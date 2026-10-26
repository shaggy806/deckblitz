import { defineCard } from "../define.js";

// EDHREC rank 20507.
export default defineCard({
  name: "Flight Spellbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text:
    "{T}, Sacrifice this artifact: Target creature gains flying until end of turn.\n" +
    "When this artifact is put into a graveyard from the battlefield, you may pay {U}. If you do, draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Target creature gains flying until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Pay {U} to draw a card?", cost: "{U}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "When this artifact is put into a graveyard from the battlefield, you may pay {U}. If you do, draw a card.",
    },
  ],
});
