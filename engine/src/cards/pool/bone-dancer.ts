import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): `top-of-graveyard` over the defending player's pile, reached
// as the `for-each-player`'s "that-player" over `"trigger-player"`. With no creature card
// there, nothing is put onto the battlefield, so "if you do" never applies.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may put the top creature card of defending player's graveyard onto the battlefield under your control. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Bone Dancer",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put the top creature card of defending player's graveyard onto the battlefield under your control?",
        effect: {
          kind: "for-each-player",
          who: "trigger-player",
          effect: {
            kind: "top-of-graveyard",
            whose: "that-player",
            filter: { type: "creature" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "put-onto-battlefield", target: 0, underYourControl: true },
                { kind: "assigns-no-combat-damage", target: "source" },
              ],
            },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
