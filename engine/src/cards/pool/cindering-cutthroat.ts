import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 13355.
//
// Cackling Slasher's gated enters-with counter, on Rakdos, Lord of Riots' "an opponent
// lost life this turn" — life lost, not the net change (the ruling).
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it if an opponent lost life this turn.";
const MENACE_TEXT = "{1}{B/R}: This creature gains menace until end of turn.";

export default defineCard({
  name: "Cindering Cutthroat",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Assassin"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${MENACE_TEXT} (It can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B/R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
      resolve: null,
      text: MENACE_TEXT,
    },
  ],
});
