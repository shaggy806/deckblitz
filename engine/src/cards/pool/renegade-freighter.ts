import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Kaladesh (KLD). EDHREC rank 19100.
const ATTACK = "Whenever this Vehicle attacks, it gets +1/+1 and gains trample until end of turn.";

export default defineCard({
  name: "Renegade Freighter",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  text: `${ATTACK}\n${crewText(2)}`,
  activated: [crew(2, crewText(2))],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
