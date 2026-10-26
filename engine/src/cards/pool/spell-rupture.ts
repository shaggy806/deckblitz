import { defineCard } from "../define.js";

// EDHREC rank 11619.
//
// Rulings:
//   [2013-01-24] The value of X is the greatest power among creatures you control when Spell
//     Rupture resolves. If you control no creatures at that time, X will be 0. The target spell’s
//     controller can choose to pay {0} (simply by indicating they wish to do so). That player can
//     also choose to not pay {0} and the spell will be countered.

export default defineCard({
  name: "Spell Rupture",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {X}, where X is the greatest power among creatures you control.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    // The greatest power is read as the spell resolves (0 with no creatures).
    options: [
      {
        payGeneric: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
        text: "Pay {X}, where X is the greatest power among creatures Spell Rupture's controller controls.",
      },
    ],
    otherwise: { kind: "counter", target: 0 },
  },
});
