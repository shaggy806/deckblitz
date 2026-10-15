import { defineCard } from "../define.js";

// EDHREC rank 12618. Erebos, Bleak-Hearted's "you may pay N life. If you do".

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may pay 1 life. If you do, draw a card and put a +1/+1 counter on Seymour Flux.";

export default defineCard({
  name: "Seymour Flux",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 5,
  toughness: 5,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 1 life to draw a card and put a +1/+1 counter on Seymour Flux?",
        costLife: 1,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
