import { defineCard } from "../define.js";

// "Half … of their choice, rounded down", read as it resolves. While suspended,
// the player whose upkeep it is may keep it suspended by sacrificing.
const UPKEEP =
  "At the beginning of each player's upkeep, if this card is suspended, that player may sacrifice a permanent of their choice. If the player does, put two time counters on this card.";

export default defineCard({
  name: "Curse of the Cabal",
  manaCost: "{9}{B}",
  colors: ["B"],
  types: ["sorcery"],
  suspend: { n: 2, cost: "{2}{B}{B}" },
  text: `Target player sacrifices half the permanents they control of their choice, rounded down.\nSuspend 2—{2}{B}{B} (Rather than cast this card from your hand, you may pay {2}{B}{B} and exile it with two time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)\n${UPKEEP}`,
  targets: ["player"],
  effect: {
    kind: "sacrifice",
    who: "target",
    filter: {},
    count: { half: { countOf: { controlledBy: "you" }, forPlayer: { target: 0 } }, round: "down" },
  },
  triggered: [
    {
      whileSuspended: true,
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        options: [{ sacrifice: { controlledBy: "you" }, count: 1, text: "Sacrifice a permanent" }],
        ifDid: { kind: "add-counter", target: "source", counter: "time", amount: 2 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
