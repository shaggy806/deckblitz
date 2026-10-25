import { defineCard } from "../define.js";

// EDHREC rank 27364. Paid as it resolves (the ruling); the card is picked at
// random then, from whatever is there — not a target (`choose-random-card`).
// The leave-replacement follows the creature itself
// (`put-onto-battlefield { exileIfItWouldLeave }`, Whip of Erebos's shape),
// and the keywords are a grant with no duration, so neither depends on the
// returned creature keeping its abilities. The trigger is on your own upkeep,
// so "your next end step" is this turn's.

const TEXT =
  "At the beginning of your upkeep, you may pay {2}{B}. If you do, return a creature card at random from your graveyard to the battlefield. It gains flying, trample, and haste. Exile that card at the beginning of your next end step. If it would leave the battlefield, exile it instead of putting it anywhere else.";

export default defineCard({
  name: "Kheru Lich Lord",
  manaCost: "{3}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to return a creature card at random from your graveyard?",
        cost: "{2}{B}",
        effect: {
          kind: "choose-random-card",
          zone: "graveyard",
          filter: { type: "creature" },
          then: {
            kind: "sequence",
            effects: [
              { kind: "put-onto-battlefield", target: 0, underYourControl: true, exileIfItWouldLeave: true },
              { kind: "grant-keyword", target: 0, keyword: "flying", duration: "permanent" },
              { kind: "grant-keyword", target: 0, keyword: "trample", duration: "permanent" },
              { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
              {
                kind: "delayed-trigger",
                at: "your-next-end-step",
                effect: { kind: "exile", target: 0 },
                text: "Exile the creature Kheru Lich Lord returned.",
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
