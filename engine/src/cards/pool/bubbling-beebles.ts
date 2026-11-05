import { defineCard } from "../define.js";

// EDHREC rank 29941.

export default defineCard({
  name: "Bubbling Beebles",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beeble"],
  power: 3,
  toughness: 3,
  text: "This creature can't be blocked as long as defending player controls an enchantment.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked as long as defending player controls an enchantment.",
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
      },
    },
  ],
});
