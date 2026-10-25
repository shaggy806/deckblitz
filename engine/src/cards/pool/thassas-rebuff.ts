import { defineCard } from "../define.js";

// EDHREC rank 15076.

export default defineCard({
  name: "Thassa's Rebuff",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {X}, where X is your devotion to blue. (Each {U} in the mana costs of permanents you control counts toward your devotion to blue.)",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    // Devotion is counted as the spell resolves.
    options: [{ payGeneric: { devotionTo: ["U"] }, text: "Pay {X}, where X is their devotion to blue." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
