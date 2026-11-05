import { defineCard } from "../define.js";

// EDHREC rank 22729.

export default defineCard({
  name: "Rhox",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Beast"],
  power: 5,
  toughness: 5,
  text: "You may have this creature assign its combat damage as though it weren't blocked.\n{2}{G}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{G}: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      assignAsThoughUnblocked: true,
      text: "You may have this creature assign its combat damage as though it weren't blocked.",
    },
  ],
});
