import { defineCard } from "../define.js";

// EDHREC rank 20918. The Germ is a 0/0 for a moment before the Equipment
// joins it, all within the resolution, so state-based actions only see it
// equipped — and it dies then if the Equipment gives no toughness, the
// Equipment staying yours (the rulings).
export default defineCard({
  name: "Grip of Phyresis",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Gain control of target Equipment, then create a 0/0 black Phyrexian Germ creature token and attach that Equipment to it.",
  targets: [{ kind: "permanent", filter: { subtype: "Equipment" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "create-token", token: "Phyrexian Germ Token", count: 1 },
      { kind: "attach", target: "created", attachment: 0 },
    ],
  },
});
