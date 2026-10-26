import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 27930.
//
// The targeted player decides (`unless` with the player slot as chooser);
// paying 7 life is offered only to a player who can (rule 119.4). Their hand
// is discarded as a `discard` of every card in it — `discard-hand` takes a
// player scope, not a target (Collective Defiance's shape).

export default defineCard({
  name: "Tyrannize",
  manaCost: "{3}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Target player discards their hand unless they pay 7 life.",
  targets: ["player"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payLife: 7, text: "Pay 7 life" }],
    otherwise: { kind: "discard", target: 0, amount: { cardsInHand: "each" } },
  },
});
