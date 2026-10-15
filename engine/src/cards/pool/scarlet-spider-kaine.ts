import { defineCard } from "../define.js";

const MENACE_TEXT = "Menace (This creature can't be blocked except by two or more creatures.)";
const ENTER_TEXT = "When Scarlet Spider enters, you may discard a card. If you do, put a +1/+1 counter on him.";
const MAYHEM_TEXT =
  "Mayhem {B/R} (You may cast this card from your graveyard for {B/R} if you discarded it this turn. Timing rules still apply.)";

export default defineCard({
  name: "Scarlet Spider, Kaine",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  mayhem: { cost: "{B/R}" },
  text: `${MENACE_TEXT}\n${ENTER_TEXT}\n${MAYHEM_TEXT}`,
  triggered: [
    {
      // Big Wheel's "you may discard a card. If you do, …" — the counter only
      // when a card was actually discarded.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to put a +1/+1 counter on Scarlet Spider?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
