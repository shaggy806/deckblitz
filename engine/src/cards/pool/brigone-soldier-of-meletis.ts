import { defineCard } from "../define.js";

// EDHREC rank 8794.
//
// Rulings:
//   [2024-11-08] Brigone's second ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack without resolving.

// Heroic is a cast trigger whose spell targets this permanent (among
// whatever else it targets) — Zada, Hedron Grinder's targets clause without
// its "only".
export default defineCard({
  name: "Brigone, Soldier of Meletis",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nHeroic — Whenever you cast a spell that targets Brigone, put a +1/+1 counter on Brigone.\n{T}, Remove a +1/+1 counter from Brigone: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Remove a +1/+1 counter from Brigone: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets Brigone, put a +1/+1 counter on Brigone.",
    },
  ],
});
