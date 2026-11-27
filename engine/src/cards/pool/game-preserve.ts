import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 26961.
//
// Each player reveals their top card (`reveal-top` `who: "each-player"`,
// parley's shape); only when none of them is a non-creature card do they all
// enter, at once, under their owners' control
// (`put-exiled-this-way-onto-battlefield` `revealed`). With every library
// empty nothing is revealed, and nothing enters.
const TEXT =
  "At the beginning of your upkeep, each player reveals the top card of their library. If all cards revealed this way are creature cards, put those cards onto the battlefield under their owners' control.";

export default defineCard({
  name: "Game Preserve",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "reveal-top",
        who: "each-player",
        then: {
          kind: "conditional",
          condition: {
            kind: "amounts",
            left: { thisWay: "revealed", filter: { notTypes: ["creature"] } },
            op: "eq",
            right: 0,
          },
          then: { kind: "put-exiled-this-way-onto-battlefield", revealed: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
