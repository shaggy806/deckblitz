import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 31929.

export default defineCard({
  name: "Warped Researcher",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Mutant"],
  power: 3,
  toughness: 4,
  text: "Whenever a player cycles a card, this creature gains flying and shroud until end of turn. (It can't be the target of spells or abilities.)",
  triggered: [
    {
      trigger: { on: "cycles", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever a player cycles a card, this creature gains flying and shroud until end of turn.",
    },
  ],
});
