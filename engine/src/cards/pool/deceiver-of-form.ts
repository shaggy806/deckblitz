import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "At the beginning of combat on your turn, reveal the top card of your library. If a creature card is revealed this way, you may have creatures you control other than this creature become copies of that card until end of turn. You may put that card on the bottom of your library.";

export default defineCard({
  name: "Deceiver of Form",
  manaCost: "{6}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 8,
  toughness: 8,
  text: `({C} represents colorless mana.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "creature" } },
              then: {
                kind: "may",
                prompt: "Have your other creatures become copies of that card?",
                effect: {
                  kind: "become-copy",
                  filter: { type: "creature", controlledBy: "you", isSource: false },
                  of: 0,
                  ofCard: true,
                  until: "end-of-turn",
                },
              },
            },
            {
              kind: "may",
              prompt: "Put that card on the bottom of your library?",
              effect: { kind: "put-on-library", target: 0, position: "bottom" },
            },
          ],
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
