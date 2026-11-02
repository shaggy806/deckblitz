import { defineCard } from "../define.js";

export default defineCard({
  name: "Mindclaw Shaman",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, target opponent reveals their hand. You may cast an instant or sorcery spell from among those cards without paying its mana cost.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When this creature enters, target opponent reveals their hand. You may cast an instant or sorcery spell from among those cards without paying its mana cost.",
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-hand", who: 0 },
          { kind: "cast-now", from: { handOf: { target: 0 } }, free: true, spell: { typesAnyOf: ["instant", "sorcery"] } },
        ],
      },
    },
  ],
});
