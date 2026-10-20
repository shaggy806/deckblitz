import { defineCard } from "../define.js";

// EDHREC rank 13949. Counted as the ability resolves, and a permanent that's
// both a Wolf and a Werewolf counts once (the rulings) — `subtypes` is an OR.
const TEXT =
  "{3}{R}, {T}: This creature deals damage equal to the number of Wolves and Werewolves you control to target opponent.";

export default defineCard({
  name: "Runebound Wolf",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "damage",
        target: 0,
        amount: { countOf: { controlledBy: "you", subtypes: ["Wolf", "Werewolf"] } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
