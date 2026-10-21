import { defineCard } from "../define.js";

// Wildborn Preserver's "you may pay {X}. When you do": the reflexive trigger
// carries the X paid, which its target filter reads (rule 603.12 — the
// target is chosen once the mana is paid, per the third ruling). The card
// keeps its exile-if-it-would-leave after Isareth has gone (the last
// ruling) — From the Catacombs' shape.
const TEXT =
  "Whenever Isareth attacks, you may pay {X}. When you do, return target creature card with mana value X from your graveyard to the battlefield with a corpse counter on it. If that creature would leave the battlefield, exile it instead of putting it anywhere else.";

export default defineCard({
  name: "Isareth the Awakener",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to return a creature card with mana value X from your graveyard?",
        cost: "{X}",
        effect: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "card-in-graveyard",
              whose: "you",
              filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
            },
          ],
          effect: {
            kind: "put-onto-battlefield",
            target: 0,
            withCounters: { kind: "corpse", amount: 1 },
            exileIfItWouldLeave: true,
          },
          text: "When you do, return target creature card with mana value X from your graveyard to the battlefield with a corpse counter on it. If that creature would leave the battlefield, exile it instead of putting it anywhere else.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
