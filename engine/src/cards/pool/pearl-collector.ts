import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure and "perpetually" are MTG Arena's
// (the `conjure` effect; `grant-keyword`'s `perpetually`: the lifelink stays
// with that card in every zone for the rest of the game). "This ability
// triggers only once" is ever, for this object (`triggersOnlyOnce`).
const CONJURE_TEXT =
  "At the beginning of your second main phase, if you gained 4 or more life this turn, conjure a card named Mox Pearl into your hand. This ability triggers only once.";
const PERPETUAL_TEXT = "{2}{W}: Another target creature perpetually gains lifelink.";

export default defineCard({
  name: "Pearl Collector",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch, lifelink\n${CONJURE_TEXT}\n${PERPETUAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 4 },
        ],
      },
      triggersOnlyOnce: true,
      targets: [],
      effect: { kind: "conjure", name: "Mox Pearl", to: "hand" },
      resolve: null,
      text: CONJURE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "permanent", perpetually: true },
      resolve: null,
      text: PERPETUAL_TEXT,
    },
  ],
});
