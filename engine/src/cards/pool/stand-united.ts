import { defineCard } from "../define.js";

// EDHREC rank 25822. "If it's an Ally" reads the target as the spell resolves.
export default defineCard({
  name: "Stand United",
  manaCost: "{1}{G/W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If it's an Ally, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Ally" } },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});
