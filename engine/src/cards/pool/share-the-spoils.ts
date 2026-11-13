import { defineCard } from "../define.js";

// The cards it exiles are exiled with it (rule 607.2a), and the permission
// over them is every player's (`eachPlayer`), during their own turn, one play
// a turn (`oncePerTurn`, spent on the enchantment by whoever's turn it is).
// "When they do" fires on a play under this permission alone (`underThis`);
// "their library" is that player's.
const EXILE_TEXT =
  "When this enchantment enters and whenever an opponent loses the game, exile the top card of each player's library.";
const PLAY_TEXT =
  "During each player's turn, that player may play a land or cast a spell from among cards exiled with this " +
  "enchantment, and they may spend mana as though it were mana of any color to cast that spell. When they do, " +
  "exile the top card of their library.";

const exileEach = { kind: "exile-from-library", whose: "each-player", amount: 1, linked: true } as const;

export default defineCard({
  name: "Share the Spoils",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: exileEach,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "event", event: "loses-game", who: "opponent" },
      targets: [],
      effect: exileEach,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "plays-card", who: "any", underThis: true },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1, linked: true },
      resolve: null,
      text: "When they do, exile the top card of their library.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      text: PLAY_TEXT,
      mayPlay: {
        from: "exile",
        play: true,
        filter: {},
        linked: true,
        eachPlayer: true,
        yourTurnOnly: true,
        oncePerTurn: true,
        spendAs: "any-color",
      },
    },
  ],
});
