import { defineCard } from "../define.js";

// EDHREC rank 16396.

export default defineCard({
  name: "Spinebiter",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 3,
  toughness: 4,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nYou may have this creature assign its combat damage as though it weren't blocked.",
  static: [
    {
      affects: { scope: "self" },
      assignAsThoughUnblocked: true,
      text: "You may have this creature assign its combat damage as though it weren't blocked.",
    },
  ],
});
