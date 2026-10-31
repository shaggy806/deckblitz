import { defineCard } from "../define.js";

// An opponent you choose picks one of the targets still legal as it
// resolves (`choose-among-targets` inside `choose-opponent`): that card goes
// to your hand, the other to the battlefield with haste, exiled at the next
// end step. With only one target, or one still legal, it's the one chosen
// and goes to your hand.
const CARD = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;

export default defineCard({
  name: "Wake to Slaughter",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  flashback: { cost: "{4}{B}{R}" },
  text: "Choose up to two target creature cards in your graveyard. An opponent chooses one of them. Return that card to your hand. Return the other to the battlefield under your control. It gains haste. Exile it at the beginning of the next end step.\nFlashback {4}{B}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    { kind: "optional", of: CARD },
    { kind: "optional", of: { kind: "other", of: CARD, than: { slots: [0] } } },
  ],
  effect: {
    kind: "choose-opponent",
    then: {
      kind: "choose-among-targets",
      chooser: "that-player",
      count: 1,
      prompt: "Choose the card that returns to its owner's hand — the other enters the battlefield with haste",
      chosen: "hand",
      rest: {
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: 0 },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "exile", target: 0 },
              text: "Exile the creature Wake to Slaughter returned to the battlefield.",
            },
          ],
        },
      },
    },
  },
});
