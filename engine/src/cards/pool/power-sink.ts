import { defineCard } from "../define.js";

const TEXT =
  "Counter target spell unless its controller pays {X}. If that player doesn't, they tap all lands with mana abilities they control and lose all unspent mana.";

// EDHREC rank 9749. Only lands that really have mana abilities tap, and tapping
// them this way isn't "tapped for mana" (the rulings).
export default defineCard({
  name: "Power Sink",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: "x", text: "Pay {X}" }],
    otherwise: {
      kind: "sequence",
      effects: [
        { kind: "counter", target: 0 },
        { kind: "tap-all", filter: { type: "land", hasManaAbility: true, controlledBy: "you" }, controlledByTarget: 0 },
        { kind: "lose-unspent-mana", who: { controllerOf: 0 } },
      ],
    },
  },
});
