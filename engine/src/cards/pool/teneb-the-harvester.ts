import { defineCard } from "../define.js";

// EDHREC rank 8502.
//
// Rulings:
//   You choose the target when the ability is put on the stack, and you choose whether to pay when it resolves.

export default defineCard({
  name: "Teneb, the Harvester",
  manaCost: "{3}{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nWhenever Teneb deals combat damage to a player, you may pay {2}{B}. If you do, put target creature card from a graveyard onto the battlefield under your control.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to put the targeted creature card onto the battlefield under your control?",
        cost: "{2}{B}",
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      resolve: null,
      text: "Whenever Teneb deals combat damage to a player, you may pay {2}{B}. If you do, put target creature card from a graveyard onto the battlefield under your control.",
    },
  ],
});
