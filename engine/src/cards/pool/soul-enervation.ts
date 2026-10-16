import { defineCard } from "../define.js";

// EDHREC rank 11112.
//
// "One or more creature cards leave your graveyard" is one batched trigger
// per simultaneous move (the ruling) — Undead Hand Ninja's.
const ENTERS = "When this enchantment enters, target creature gets -4/-4 until end of turn.";
const DRAIN =
  "Whenever one or more creature cards leave your graveyard, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Soul Enervation",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ENTERS}\n${DRAIN}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "leaves-graveyard", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
  ],
});
