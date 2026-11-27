import { defineCard } from "../define.js";

// EDHREC rank 25656. Sokenzan Renegade's shape with life totals: an intervening
// "if" (rule 603.4), asked again as it resolves — players tied for the most
// life, at either point, and nothing happens. `whoIf` finds the one player it
// holds for; if that's its controller already, the control change does
// nothing.

const TEXT =
  "At the beginning of your upkeep, if a player has more life than each other player, the player with the most life gains control of this creature.";

const MOST_LIFE = { kind: "player-compare", stat: "life", compare: "more", than: "each-opponent" } as const;

export default defineCard({
  name: "Wild Dogs",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 1,
  cycling: { cost: "{2}" },
  text: `${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "any", of: [MOST_LIFE, { kind: "of-player", player: "an-opponent", condition: MOST_LIFE }] },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: { kind: "of-player", player: "that-player", condition: MOST_LIFE },
        effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
