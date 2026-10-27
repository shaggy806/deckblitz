import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 31603. Callous Deceiver's shapes:
// a look that takes nothing, and a reveal bound to slot 0 for the land check.

const LOOK_TEXT = "{1}: Look at the top card of your library.";
const REVEAL_TEXT =
  "{2}: Reveal the top card of your library. If it's a land card, untap this creature and it gets +1/+1 until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Harsh Deceiver",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 4,
  text: `${LOOK_TEXT}\n${REVEAL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "look-and-choose", zone: "library", count: 1, min: 0, max: 0, destination: "hand", leftover: "stay" },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "land" } },
          then: {
            kind: "sequence",
            effects: [
              { kind: "untap", target: "source" },
              { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
            ],
          },
        },
      },
      resolve: null,
      text: REVEAL_TEXT,
      oncePerTurn: true,
    },
  ],
});
