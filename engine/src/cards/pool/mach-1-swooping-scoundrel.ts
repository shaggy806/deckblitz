import { defineCard } from "../define.js";

// EDHREC rank 25940.
//
// One ability with two trigger events (Entity Tracker's shape): the second
// entry names the first (`sameAbilityAs`), so "triggers only once each turn"
// is counted across both — entering and gaining life the same turn surveils
// once.

const TEXT =
  "When MACH-1 enters and whenever you gain life, surveil 1. This ability triggers only once each turn. (To surveil 1, look at the top card of your library. You may put it into your graveyard.)";

export default defineCard({
  name: "MACH-1, Swooping Scoundrel",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Villain"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: TEXT,
    },
    {
      trigger: { on: "gains-life", who: "you" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: TEXT,
    },
  ],
});
