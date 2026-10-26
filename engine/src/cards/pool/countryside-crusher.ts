import { defineCard } from "../define.js";

// EDHREC rank 21930.
//
// Rulings:
//   [2008-04-01] The first ability will keep putting cards from the top of your library into your
//     graveyard until you reveal a nonland card. That nonland card remains on top of your library.
//   [2008-04-01] Each time you put a land card into your graveyard with the first ability, the
//     second ability will trigger. Those triggers wait to be put onto the stack until the first
//     ability has completely finished resolving.
//
// "Reveal the top card; if it's a land, put it into your graveyard and repeat"
// is revealing until a nonland card: every land revealed goes to the
// graveyard, and the nonland card found stays on top (`keepFound`). A library
// of only lands goes to the graveyard whole.

const UPKEEP =
  "At the beginning of your upkeep, reveal the top card of your library. If it's a land card, put it into your graveyard and repeat this process.";
const GROW = "Whenever a land card is put into your graveyard from anywhere, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Countryside Crusher",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${UPKEEP}\n${GROW}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "reveal-until", filter: { notTypes: ["land"] }, rest: "graveyard", keepFound: true },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW,
    },
  ],
});
