import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 18102.

const DESTROY_MODE = "Destroy target blue permanent.";
const BOUNCE_MODE = "Return target Island to its owner's hand.";

export default defineCard({
  name: "Active Volcano",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${DESTROY_MODE}\n• ${BOUNCE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DESTROY_MODE,
        targets: [{ kind: "permanent", filter: { colors: ["U"] } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: BOUNCE_MODE,
        targets: [{ kind: "permanent", filter: { subtype: "Island" } }],
        effect: { kind: "return-to-hand", target: 0 },
      },
    ],
  },
});
