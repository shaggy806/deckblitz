import { defineCard } from "../define.js";

// EDHREC rank 9338.
//
// "Your commander" is a commander you own (rule 903.3), whoever casts it.
// Each commander counts its own casts from the command zone (rule 903.8's
// count, the commander tax's), read for the spell being priced: one {1} off
// for each, against the {2} of tax each added. "Put into the command zone
// from anywhere" is every way there (rules 903.9a, 903.9b), not its first
// placement as the game begins.

const COST = "Your commander costs {1} less to cast for each time it's been cast from the command zone this game.";
const DRAW = "Whenever your commander is put into the command zone from anywhere, draw a card.";

export default defineCard({
  name: "Myth Unbound",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${COST}\n${DRAW}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { isCommander: true, ownedBy: "you" }, reduceGeneric: { commanderCastsOf: "priced" } },
      text: COST,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "commander-to-command-zone", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
