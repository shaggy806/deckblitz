import { defineCard } from "../define.js";

// EDHREC rank 15758.
//
// The creature cards this mill put into the graveyard come back together
// (`thisWay: "milled"`, all at once), gain haste with no duration — for as
// long as they stay (Puppeteer Clique) — over the ones put onto the
// battlefield this way (Strefan, Maurer Progenitor's grant), and a delayed
// ability about those same permanents (`about`, Vindictive Triumph's shape)
// returns each still there to its owner's hand at the next end step. One
// that left and came back in between is a new object it doesn't touch (rule
// 400.7).

const TEXT =
  "Shuffle your library, then mill four cards. Put each creature card milled this way onto the battlefield. They gain haste. At the beginning of the next end step, return those creatures to their owner's hand.";

export default defineCard({
  name: "Random Encounter",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{6}{R}{R}" },
  text: `${TEXT}\nFlashback {6}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-library" },
      { kind: "mill", target: "you", amount: 4 },
      {
        kind: "return-from-graveyard",
        filter: { type: "creature", thisWay: "milled" },
        destination: "battlefield",
        count: "all",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", thisWay: "put-onto-battlefield" },
        keyword: "haste",
        duration: "permanent",
      },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        about: "put-onto-battlefield",
        effect: {
          kind: "for-each-target",
          from: 0,
          effect: { kind: "return-to-hand", target: 0 },
          simultaneous: true,
        },
        text: "Return those creatures to their owner's hand.",
      },
    ],
  },
});
