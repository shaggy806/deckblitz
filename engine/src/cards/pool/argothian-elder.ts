import { defineCard } from "../define.js";

// Urza's Saga. The two targets must be different lands (the ruling); either
// may already be untapped.
export default defineCard({
  name: "Argothian Elder",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: "{T}: Untap two target lands.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land", { kind: "other", of: "land", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: "{T}: Untap two target lands.",
    },
  ],
});
