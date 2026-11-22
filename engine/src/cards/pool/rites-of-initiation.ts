import { defineCard } from "../define.js";

// "Discard any number of cards at random": the number is chosen as the spell
// resolves (a `choose-value` number, 0 to the hand's size), then the game picks
// that many cards at random. The bonus counts the cards actually discarded, read
// once as the spell resolves.
export default defineCard({
  name: "Rites of Initiation",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Discard any number of cards at random. Creatures you control get +1/+0 until end of turn for each card discarded this way.",
  effect: {
    kind: "choose-value",
    value: "number",
    min: 0,
    max: { cardsInHand: "you" },
    prompt: "Discard how many cards at random?",
    then: {
      kind: "sequence",
      effects: [
        { kind: "discard", target: "you", amount: "x", random: true },
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: { thisWay: "discarded" },
          toughness: 0,
          duration: "end-of-turn",
        },
      ],
    },
  },
});
