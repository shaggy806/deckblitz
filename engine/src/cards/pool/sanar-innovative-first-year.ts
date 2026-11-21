import { defineCard } from "../define.js";

// Vivid. X, and so the colours, are read once as the ability resolves (the
// ruling). "For each of those colors, you may exile a card of that color" is
// one choice over every card revealed, lands included, a slot a colour
// (`together: { oneEachColorAmong }`): a multicoloured card fills one. The
// rest stay where they were revealed until the shuffle.
const TEXT =
  "Vivid — At the beginning of your first main phase, reveal cards from the top of your library until you " +
  "reveal X nonland cards, where X is the number of colors among permanents you control. For each of those " +
  "colors, you may exile a card of that color from among the revealed cards. Then shuffle. You may cast the " +
  "exiled cards this turn.";

export default defineCard({
  name: "Sanar, Innovative First-Year",
  manaCost: "{2}{U/R}{U/R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Sorcerer"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "reveal-until-count",
            filter: { notTypes: ["land"] },
            count: { colorsAmong: { controlledBy: "you" } },
            put: "with-rest",
            rest: "stay",
          },
          {
            kind: "look-and-choose",
            zone: "revealed-this-way",
            min: 0,
            max: 5,
            together: { oneEachColorAmong: { controlledBy: "you" } },
            destination: "exile",
            leftover: "stay",
          },
          { kind: "shuffle-library" },
          { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
