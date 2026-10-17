import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Every card is exiled as it's revealed; the lands before the nonland card
// found stay exiled. Only that card — the one nonland card exiled this way —
// gets the two time counters and suspend.
const KANG_TEXT =
  "Whenever Kang Prime enters or attacks, exile cards from the top of your library until you exile a nonland card. Put two time counters on that card. If it doesn't have suspend, it gains suspend.";
const EXILE: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "reveal-until", filter: { notTypes: ["land"] }, exile: true, rest: "stay" },
    { kind: "give-suspend", timeCounters: 2, filter: { notTypes: ["land"] } },
  ],
};

export default defineCard({
  name: "Kang Prime",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${KANG_TEXT} (At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. If it's a creature, it has haste.)`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EXILE, resolve: null, text: KANG_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EXILE, resolve: null, text: KANG_TEXT },
  ],
});
