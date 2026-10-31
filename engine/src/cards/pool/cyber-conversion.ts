import { defineCard } from "../define.js";

// Turned face down by an effect (rule 708.2a) with the characteristics it
// lists (708.2): a colourless 2/2 Cyberman artifact creature with no name,
// text or mana cost. Neither manifested nor cloaked, it's turned face up only
// by its own morph or disguise cost (702.37e), if it has one. A
// double-faced creature isn't turned face down at all (rule 712.16).

export default defineCard({
  name: "Cyber Conversion",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Turn target creature face down. It's a 2/2 Cyberman artifact creature.",
  targets: ["creature"],
  effect: { kind: "turn-face-down", target: 0, as: "2/2 Cyberman artifact creature" },
});
