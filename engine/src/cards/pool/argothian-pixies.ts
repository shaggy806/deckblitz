import { defineCard } from "../define.js";

// EDHREC rank 30483.

export default defineCard({
  name: "Argothian Pixies",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 1,
  text: "This creature can't be blocked by artifact creatures.\nPrevent all damage that would be dealt to this creature by artifact creatures.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { type: "artifact" },
      text: "This creature can't be blocked by artifact creatures.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self", source: { types: ["artifact", "creature"] } },
      text: "Prevent all damage that would be dealt to this creature by artifact creatures.",
    },
  ],
});
