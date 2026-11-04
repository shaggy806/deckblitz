import { defineCard } from "../define.js";

// Whoever owns it and however it was exiled (the rulings): a suspended card
// loses its time counters as it leaves exile, and is no longer suspended.
const TEXT = "When this creature enters, choose target face-up exiled card. Its owner shuffles it into their library.";

export default defineCard({
  name: "Riftsweeper",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-exile", faceUp: true }],
      effect: { kind: "shuffle-into-library", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
