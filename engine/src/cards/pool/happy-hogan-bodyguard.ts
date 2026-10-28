import { defineCard } from "../define.js";

// EDHREC rank 29148.
//
// Trickster's Stratagem's shape: the creature's owner (not its controller)
// chooses second from the top or the bottom.

export default defineCard({
  name: "Happy Hogan, Bodyguard",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen Happy Hogan enters, the owner of target creature an opponent controls puts it into their library second from the top or on the bottom.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "put-on-library",
        target: 0,
        position: { ownerChooses: [{ fromTop: 2 }, "bottom"] },
      },
      resolve: null,
      text: "When Happy Hogan enters, the owner of target creature an opponent controls puts it into their library second from the top or on the bottom.",
    },
  ],
});
