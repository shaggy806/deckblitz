import { defineCard } from "../define.js";

export default defineCard({
  name: "Secret Rendezvous",
  // Pinned: Scryfall answers "Secret Rendezvous" by name with Joined Researchers // Secret Rendezvous, whose
  // prepare spell or adventure shares the name.
  art: "9be712b3-14ed-4a73-b3d3-5b76b2c5db64",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You and target opponent each draw three cards.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "draw", amount: 3, target: 0 },
    ],
  },
});
