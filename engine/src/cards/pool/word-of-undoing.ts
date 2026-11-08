import { defineCard } from "../define.js";

export default defineCard({
  name: "Word of Undoing",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature and all white Auras you own attached to it to their owners' hands.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      {
        kind: "return-to-hand-all",
        filter: { subtype: "Aura", colors: ["W"], ownedBy: "you", attachedToObject: 0 },
      },
      { kind: "return-to-hand", target: 0 },
    ],
  },
});
