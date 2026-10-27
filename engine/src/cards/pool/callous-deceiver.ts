import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 31291. The look is a
// look-and-choose that can take nothing (Covenant of Minds' `max: 0`): the
// card is shown to its controller alone and stays on top. The reveal binds the
// card to slot 0 for the land check (Track Down's shape).

const LOOK_TEXT = "{1}: Look at the top card of your library.";
const REVEAL_TEXT =
  "{2}: Reveal the top card of your library. If it's a land card, this creature gets +1/+0 and gains flying until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Callous Deceiver",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
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
              { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
              { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
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
