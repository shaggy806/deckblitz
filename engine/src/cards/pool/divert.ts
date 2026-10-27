import { defineCard } from "../define.js";

// EDHREC rank 20264.

export default defineCard({
  name: "Divert",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Change the target of target spell with a single target unless that spell's controller pays {2}.",
  targets: [{ kind: "stack", spells: "any", abilities: false, singleTarget: true }],
  // Deflection's change, behind Quench's punisher: the spell's controller
  // chooses whether to pay; unpaid, Divert's controller changes the target.
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{2}", text: "Pay {2}" }],
    otherwise: { kind: "change-targets", target: 0, how: "change" },
  },
});
