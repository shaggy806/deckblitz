import { defineCard } from "../define.js";

const DIES_TEXT =
  "Whenever another nonartifact creature dies, return it to the battlefield under your control face down and tapped. It's a 2/2 Cyberman artifact creature.";
const END_TEXT =
  "At the beginning of your end step, each opponent faces a villainous choice — Each artifact creature you control deals 1 damage to that opponent, or you draw a card and chaos ensues.";

// "Chaos ensues" does nothing outside Planechase (rule 901.9b) — as Path of the
// Schemer's — so the second choice is the draw.
export default defineCard({
  name: "Missy",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Rogue"],
  power: 4,
  toughness: 5,
  text: `${DIES_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", otherOnly: true, filter: { type: "creature", notTypes: ["artifact"] } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        underYourControl: true,
        enterTapped: true,
        faceDown: "2/2 Cyberman artifact creature",
      },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        choices: [
          {
            text: "Each artifact creature you control deals 1 damage to that opponent.",
            effect: {
              kind: "each-deals-damage",
              filter: { types: ["artifact", "creature"], controlledBy: "you" },
              amount: 1,
              to: { who: "that-player" },
            },
          },
          { text: "You draw a card and chaos ensues.", effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
