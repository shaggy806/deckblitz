import { defineCard } from "../define.js";

export default defineCard({
  name: "Clockwork Gnomes",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 2,
  text: "{3}, {T}: Regenerate target artifact creature.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{3}, {T}: Regenerate target artifact creature.",
    },
  ],
});
