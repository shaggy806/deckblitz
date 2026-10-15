import { defineCard } from "../define.js";

// EDHREC rank 10035.
//
// Rulings:
//   [2025-06-06] Use the number of creatures you control and the number of Equipment you
//     control when Slash of Light resolves to determine how much damage is dealt.
//
// An Equipment creature counts in both numbers, as the text adds them.
export default defineCard({
  name: "Slash of Light",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Slash of Light deals damage equal to the number of creatures you control plus the number of Equipment you control to target creature.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      sum: [
        { countOf: { type: "creature", controlledBy: "you" } },
        { countOf: { subtype: "Equipment", controlledBy: "you" } },
      ],
    },
  },
});
