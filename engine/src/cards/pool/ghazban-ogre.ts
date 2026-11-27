import { defineCard } from "../define.js";

// Arabian Nights. Wild Dogs' upkeep trigger (Sokenzan Renegade's shape with
// life totals): an intervening "if" (rule 603.4), asked again as it resolves.

const TEXT =
  "At the beginning of your upkeep, if a player has more life than each other player, the player with the most life gains control of this creature.";

const MOST_LIFE = { kind: "player-compare", stat: "life", compare: "more", than: "each-opponent" } as const;

export default defineCard({
  name: "Ghazbán Ogre",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 2,
  toughness: 2,
  text: TEXT,
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
