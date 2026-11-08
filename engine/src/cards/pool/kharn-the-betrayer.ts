import { defineCard } from "../define.js";

const BERZERKER = "Berzerker — Khârn the Betrayer attacks or blocks each combat if able.";
const SIGIL = "Sigil of Corruption — When you lose control of Khârn the Betrayer, draw two cards.";
const BETRAYER =
  "The Betrayer — If damage would be dealt to Khârn the Betrayer, prevent that damage and an opponent of your choice gains control of it.";

// Damage that can't be prevented is dealt, and no one gains control of it.
// Leaving the battlefield is losing control of it (the ruling).
export default defineCard({
  name: "Khârn the Betrayer",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Astartes", "Berserker"],
  power: 5,
  toughness: 1,
  text: `${BERZERKER}\n${SIGIL}\n${BETRAYER}`,
  triggered: [
    {
      trigger: { on: "loses-control", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: SIGIL,
    },
  ],
  static: [
    { affects: { scope: "self" }, restrictions: ["must-attack", "must-block"], text: BERZERKER },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { prevent: true, then: {
          kind: "choose-opponent",
          then: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "that-player" },
        }, perEvent: true },
        to: "self",
      },
      text: BETRAYER,
    },
  ],
});
