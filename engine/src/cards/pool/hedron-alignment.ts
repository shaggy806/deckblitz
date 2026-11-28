import { defineCard } from "../define.js";

// Battle for Zendikar. "You own a card named Hedron Alignment in exile, in
// your hand, in your graveyard, and on the battlefield" is one condition per
// zone under `all`, each a card you own (rule 108.3): a hand and a graveyard
// hold only their owner's cards; exile and the battlefield say `ownedBy`, so
// one an opponent controls still counts, and this one on the battlefield
// counts itself (a triggered ability's condition counts its source). Read as
// the ability resolves, after the hand is revealed (rule 701.20a).

const UPKEEP =
  "At the beginning of your upkeep, you may reveal your hand. If you do, you win the game if you own a card named Hedron Alignment in exile, in your hand, in your graveyard, and on the battlefield.";
const NAMED = { name: "Hedron Alignment" } as const;

export default defineCard({
  name: "Hedron Alignment",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  keywords: ["hexproof"],
  text: `Hexproof\n${UPKEEP}\n{1}{U}: Scry 1.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "reveal-hand", who: "you" },
            {
              kind: "conditional",
              condition: {
                kind: "all",
                of: [
                  { kind: "cards-in-exile", atLeast: 1, filter: { ...NAMED, ownedBy: "you" } },
                  { kind: "hand-size", atLeast: 1, filter: NAMED },
                  { kind: "cards-in-graveyard", atLeast: 1, filter: NAMED },
                  {
                    kind: "aggregate",
                    value: { aggregate: "count", filter: { ...NAMED, ownedBy: "you" } },
                    compare: { op: "gte", n: 1 },
                  },
                ],
              },
              then: { kind: "win-game" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "{1}{U}: Scry 1.",
    },
  ],
});
