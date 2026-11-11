import { defineCard } from "../define.js";

// EDHREC rank 6415. Divert Disaster's shape: the spell's controller is asked;
// if they pay, you surveil 2; if they don't, it's countered.
export default defineCard({
  name: "Don't Make a Sound",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {2}. If they do, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: ["spell"],
  effect: {
    kind: "each-player-may",
    who: { controllerOf: 0 },
    options: [{ pay: "{2}", text: "Pay {2}" }],
    ifDid: { kind: "surveil", amount: 2 },
    ifDidnt: { kind: "counter", target: 0 },
  },
});
