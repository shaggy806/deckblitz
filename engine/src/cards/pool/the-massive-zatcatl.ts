import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Tap three untapped creatures you
// control" isn't {T} (rule 302.6), so it may be one of them, summoning sick or
// not — Diversionary Tactics' shape.

export default defineCard({
  name: "The Massive Zatcatl",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Cat", "Wizard"],
  power: 6,
  toughness: 6,
  text: "Whenever you cast a creature spell, draw a card.\nTap three untapped creatures you control: Add {G}{G}{G}.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 3, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 3 },
      resolve: null,
      text: "Tap three untapped creatures you control: Add {G}{G}{G}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you cast a creature spell, draw a card.",
    },
  ],
});
