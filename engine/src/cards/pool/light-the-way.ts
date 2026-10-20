import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 11930.

export default defineCard({
  name: "Light the Way",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Put a +1/+1 counter on target creature or Vehicle. Untap it.\n• Return target permanent you control to its owner's hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Put a +1/+1 counter on target creature or Vehicle. Untap it.",
        targets: [
          { kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "untap", target: 0 },
          ],
        },
      },
      {
        text: "Return target permanent you control to its owner's hand.",
        targets: [{ kind: "permanent", whose: "you", filter: {} }],
        effect: { kind: "return-to-hand", target: 0 },
      },
    ],
  },
});
