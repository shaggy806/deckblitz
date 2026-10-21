import { defineCard } from "../define.js";

// EDHREC rank 14535. "Syr Carah or an instant or sorcery spell you control"
// is two trigger events of one ability (`sameAbilityAs`). `deals-damage`
// fires once per recipient, so damage to two players at once triggers twice
// (the ruling).

const TEXT =
  "Whenever Syr Carah or an instant or sorcery spell you control deals damage to a player, exile the top card of your library. You may play that card this turn.";
const IMPULSE = { kind: "impulse-exile", amount: 1, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Syr Carah, the Bold",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `${TEXT}\n{T}: Syr Carah deals 1 damage to any target.`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: IMPULSE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { typesAnyOf: ["instant", "sorcery"] }, to: "player" },
      sameAbilityAs: 0,
      targets: [],
      effect: IMPULSE,
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: Syr Carah deals 1 damage to any target.",
    },
  ],
});
