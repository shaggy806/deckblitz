import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 10914.
//
// Rulings:
//   The decision to counter a spell or destroy a permanent is a decision made on announcement
//   before the target is selected. If the spell is redirected, this mode can't be changed, so
//   only targets of the selected type are valid.
//
// Red Elemental Blast's shape: the colour is part of each mode's target.
export default defineCard({
  name: "Blue Elemental Blast",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target red spell.\n• Destroy target red permanent.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target red spell.",
        targets: [{ kind: "spell", filter: { colors: ["R"] } }],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Destroy target red permanent.",
        targets: [{ kind: "permanent", filter: { colors: ["R"] } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
