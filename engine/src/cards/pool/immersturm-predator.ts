import { defineCard } from "../define.js";

// EDHREC rank 7080.
// "Up to one target": with none chosen the counter still goes on; with one
// chosen that's gone illegal, the ability doesn't resolve at all and there's
// no counter (the ruling, rule 608.2b). It triggers only on actually becoming
// tapped, and the sacrifice ability can be activated while it's already
// tapped (the rulings) — Rakdos, the Muscle's shape without the once-per-turn.
const TAPPED_TEXT =
  "Whenever this creature becomes tapped, exile up to one target card from a graveyard and put a +1/+1 counter on this creature.";
const SAC_TEXT = "Sacrifice another creature: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Immersturm Predator",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TAPPED_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
