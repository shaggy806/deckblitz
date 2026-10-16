import { defineCard } from "../define.js";

// EDHREC rank 26578. "Up to one" — an optional target.
const ENTER_TEXT = "When this creature enters, return up to one target tapped creature to its owner's hand.";

export default defineCard({
  name: "Peerless Ropemaster",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", tapped: true } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
