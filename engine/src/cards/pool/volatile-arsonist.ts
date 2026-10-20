import { defineCard } from "../define.js";

// Three independent optional slots, one per kind of target; the damage is
// dealt to all of them at once.
const ATTACK_TEXT =
  "Whenever this creature attacks, it deals 1 damage to each of up to one target creature, up to one target player, and/or up to one target planeswalker.";

export default defineCard({
  name: "Volatile Arsonist",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["menace", "haste", "daybound"],
  text: `Menace, haste\n${ATTACK_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: "player" },
        { kind: "optional", of: { kind: "permanent", filter: { type: "planeswalker" } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, target: 1 },
          { kind: "damage", amount: 1, target: 2 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Volatile Arsonist", "Dire-Strain Anarchist"],
  transform: true,
});
