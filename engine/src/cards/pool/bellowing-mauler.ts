import { defineCard } from "../define.js";

// Streets of New Capenna. Each player, from the active player, chooses
// whether to sacrifice a nontoken creature; each who doesn't (or can't)
// loses 4 life.
const TEXT =
  "At the beginning of your end step, each player loses 4 life unless they sacrifice a nontoken creature of their choice.";

export default defineCard({
  name: "Bellowing Mauler",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ sacrifice: { type: "creature", token: false }, text: "Sacrifice a nontoken creature" }],
        ifDidnt: { kind: "lose-life", amount: 4, who: "that-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
