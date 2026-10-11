import { defineCard } from "../define.js";

export default defineCard({
  name: "Methods of the Mighty",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one or more —\n• Destroy target artifact.\n• Destroy target tapped creature.\n• Put a +1/+1 counter on each creature you control.",
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target tapped creature.",
        targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Put a +1/+1 counter on each creature you control.",
        effect: {
          kind: "add-counter-all",
          filter: { type: "creature", controlledBy: "you" },
          counter: "+1/+1",
          amount: 1,
        },
      },
    ],
  },
});
