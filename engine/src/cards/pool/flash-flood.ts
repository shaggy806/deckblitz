import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 21320.

const DESTROY_MODE = "Destroy target red permanent.";
const BOUNCE_MODE = "Return target Mountain to its owner's hand.";

export default defineCard({
  name: "Flash Flood",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${DESTROY_MODE}\n• ${BOUNCE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DESTROY_MODE,
        targets: [{ kind: "permanent", filter: { colors: ["R"] } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: BOUNCE_MODE,
        targets: [{ kind: "permanent", filter: { subtype: "Mountain" } }],
        effect: { kind: "return-to-hand", target: 0 },
      },
    ],
  },
});
