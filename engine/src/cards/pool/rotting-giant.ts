import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 31411. Treacherous Vampire's "sacrifice it
// unless you exile a card from your graveyard": with an empty graveyard it's
// sacrificed unasked; otherwise you may exile one (your choice of which), or
// sacrifice it. One trigger for attacking, one for blocking.

const TEXT = "Whenever this creature attacks or blocks, sacrifice it unless you exile a card from your graveyard.";

const SACRIFICE_UNLESS_EXILE: EffectSpec = {
  kind: "conditional",
  condition: { kind: "cards-in-graveyard", atLeast: 1 },
  then: {
    kind: "may",
    prompt: "Exile a card from your graveyard to keep Rotting Giant? (Otherwise it's sacrificed.)",
    effect: {
      kind: "look-and-choose",
      zone: "graveyard",
      min: 1,
      max: 1,
      destination: "exile",
      unlinked: true,
      leftover: "stay",
    },
    else: { kind: "sacrifice-source" },
  },
  else: { kind: "sacrifice-source" },
};

export default defineCard({
  name: "Rotting Giant",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: SACRIFICE_UNLESS_EXILE, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: SACRIFICE_UNLESS_EXILE, resolve: null, text: TEXT },
  ],
});
