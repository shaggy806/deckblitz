import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 10790.
//
// Rulings:
//   [2004-10-04] If this card destroys a creature in combat and at the same time (using its
//     Trample ability) it damages a player, you will be able to target the destroyed creature (if
//     it was a card and not a token) to be brought back.

const HIT =
  "Whenever this creature deals combat damage to a player, you may put target creature card from that player's graveyard onto the battlefield under your control.";

export default defineCard({
  name: "Scion of Darkness",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  cycling: { cost: "{3}" },
  text: `Trample\n${HIT}\nCycling {3} ({3}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Put target creature card onto the battlefield under your control?",
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      resolve: null,
      text: HIT,
    },
  ],
});
