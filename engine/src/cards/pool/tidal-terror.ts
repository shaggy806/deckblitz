import { defineCard } from "../define.js";

// EDHREC rank 14698.
//
// "You may tap two other untapped creatures": offered only when two others
// are there to tap (it's both or nothing), and the Terror can't be blocked
// only once two were tapped this way.

const UNTAPPED = { type: "creature", controlledBy: "you", tapped: false } as const;
const ATTACK_TEXT =
  "Whenever this creature attacks, you may tap two other untapped creatures you control. If you do, this creature can't be blocked this turn.";

export default defineCard({
  name: "Tidal Terror",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 5,
  toughness: 6,
  cycling: { cost: "{2}", search: { subtype: "Island" } },
  text: `${ATTACK_TEXT}\nIslandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: UNTAPPED, atLeast: 2, excludeSelf: true },
        then: {
          kind: "may",
          prompt: "Tap two other untapped creatures you control so this creature can't be blocked this turn?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "choose-permanents",
                filter: UNTAPPED,
                min: 2,
                upTo: 2,
                exceptSource: true,
                then: { kind: "tap", target: 0 },
                prompt: "Tap two other untapped creatures you control",
              },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "tapped", atLeast: 2 },
                then: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
              },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
