import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect); "this ability triggers only once" is ever, for this object
// (`triggersOnlyOnce`) — an "if" false as it would trigger means it didn't
// trigger, so that turn doesn't use it up.
const CONJURE_TEXT =
  "At the beginning of your second main phase, if there are four or more cards in your graveyard, conjure a card named Mox Jet into your hand. This ability triggers only once.";
const RETURN_TEXT =
  "{X}{B}: Return target creature card with mana value X from your graveyard to the battlefield with a finality counter on it. Activate only as a sorcery.";

export default defineCard({
  name: "Jet Collector",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 2,
  text: `${CONJURE_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "cards-in-graveyard", atLeast: 4 },
        ],
      },
      triggersOnlyOnce: true,
      targets: [],
      effect: { kind: "conjure", name: "Mox Jet", to: "hand" },
      resolve: null,
      text: CONJURE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{B}", tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
      sorcerySpeed: true,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
