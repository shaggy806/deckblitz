import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// One search for up to two Plains when the target opponent controls more
// lands than you as it resolves (its ruling), up to one otherwise: the
// "additional Plains card" is a search the player may make, and nothing has
// to be found (the other ruling), so the two read the same, and the cards are
// revealed and the library shuffled once either way.
const plains = (max: number): EffectSpec => ({
  kind: "search-library",
  filter: { subtype: "Plains" },
  destination: "hand",
  reveal: true,
  min: 0,
  max,
});

export default defineCard({
  name: "Tithe",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Search your library for a Plains card. If target opponent controls more lands than you, you may search your library for an additional Plains card. Reveal those cards, put them into your hand, then shuffle.",
  targets: ["opponent"],
  effect: {
    kind: "conditional",
    condition: { kind: "player-compare", stat: { controls: { type: "land" } }, compare: "fewer", than: { target: 0 } },
    then: plains(2),
    else: plains(1),
  },
});
