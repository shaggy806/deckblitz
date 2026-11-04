import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, if a player has more cards in hand than each other player, the player who has the most cards in hand gains control of this creature.";
const BUSHIDO = "Bushido 1";
const PUMP = { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" } as const;

const MOST_IN_HAND = { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" } as const;

// An intervening "if" (rule 603.4), asked again as it resolves: players tied
// for the most, at either point, and it does nothing (the ruling). `whoIf` is
// the same question, and finds the one player it's true of.
export default defineCard({
  name: "Sokenzan Renegade",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Samurai", "Mercenary"],
  power: 3,
  toughness: 3,
  text: `Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${TEXT}`,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "any", of: [MOST_IN_HAND, { kind: "of-player", player: "an-opponent", condition: MOST_IN_HAND }] },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: { kind: "of-player", player: "that-player", condition: MOST_IN_HAND },
        effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
