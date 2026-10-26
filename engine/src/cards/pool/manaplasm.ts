import { defineCard } from "../define.js";

// EDHREC rank 16426.
// The spell's mana value on the stack, X included (the rulings).

const TEXT = "Whenever you cast a spell, this creature gets +X/+X until end of turn, where X is that spell's mana value.";

export default defineCard({
  name: "Manaplasm",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaValueOf: "trigger-object" },
        toughness: { manaValueOf: "trigger-object" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
