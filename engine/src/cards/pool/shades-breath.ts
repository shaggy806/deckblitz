import { defineCard } from "../define.js";

const GRANTED = "{B}: This creature gets +1/+1 until end of turn.";

// "Becomes a black Shade": its colour is black only (layer 5) and Shade its
// only creature type (layer 4), each creature it finds as it resolves.
export default defineCard({
  name: "Shade's Breath",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Until end of turn, each creature you control becomes a black Shade and gains "${GRANTED}"`,
  targets: [],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", controlledBy: "you" },
    simultaneous: true,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "become", target: 0, setColors: ["B"], duration: "end-of-turn" },
        { kind: "become", target: 0, setSubtypes: ["Shade"], duration: "end-of-turn" },
        {
          kind: "grant-activated",
          target: 0,
          ability: {
            cost: { mana: "{B}", tap: false },
            targets: [],
            effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
            resolve: null,
            text: GRANTED,
          },
          duration: "end-of-turn",
        },
      ],
    },
  },
});
