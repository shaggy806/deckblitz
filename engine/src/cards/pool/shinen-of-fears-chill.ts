import { defineCard } from "../define.js";

export default defineCard({
  name: "Shinen of Fear's Chill",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  text: "This creature can't block.\nChannel — {1}{B}, Discard this card: Target creature can't block this turn.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "Channel — {1}{B}, Discard this card: Target creature can't block this turn.",
      zone: "hand",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
