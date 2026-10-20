import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const searchUpTo = (max: number): EffectSpec => ({
  kind: "each-player-may",
  who: { controllerOfTarget: 0 },
  prompt: max === 1 ? "Search your library for a basic land card?" : "Search your library for up to two basic land cards?",
  effect: {
    kind: "search-library",
    filter: { type: "land", supertype: "basic" },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max,
  },
});

export default defineCard({
  name: "Dire-Strain Rampage",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  flashback: { cost: "{3}{R}{G}" },
  text: "Destroy target artifact, enchantment, or land. If a land was destroyed this way, its controller may search their library for up to two basic land cards, put them onto the battlefield tapped, then shuffle. Otherwise, its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.\nFlashback {3}{R}{G}",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment", "land"] } }],
  // A target that survives (indestructible) still gives its controller the
  // one-land search, even if it's a land (its ruling): the two-land search
  // asks whether a land was actually destroyed.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "destroyed", filter: { type: "land" } },
        then: searchUpTo(2),
        else: searchUpTo(1),
      },
    ],
  },
});
