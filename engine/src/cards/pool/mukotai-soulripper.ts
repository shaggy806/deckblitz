import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 16864.
//
// High-Society Hunter's "you may sacrifice another …. If you do" over an
// artifact or creature, with Vito's Inquisitor's counter and menace.
const ATTACK_TEXT =
  "Whenever this Vehicle attacks, you may sacrifice another artifact or creature. If you do, put a +1/+1 counter on this Vehicle and it gains menace until end of turn.";

export default defineCard({
  name: "Mukotai Soulripper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["artifact", "creature"] },
            exceptSource: true,
            text: "Sacrifice another artifact or creature",
          },
        ],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
