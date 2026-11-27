import { defineCard } from "../define.js";

// EDHREC rank 25254. A modal DFC (Marvel's Deadpool & Friends — MDD); the back
// face is Darkchild, Demon Uncaged. A modal DFC turns over too (rule 701.27a:
// any double-faced card), so "you may transform Magik" works on either face;
// "sacrificed two or more permanents this turn" counts every permanent its
// controller sacrificed this turn, a token among them.
const FACES = ["Magik, Illyana Rasputin", "Darkchild, Demon Uncaged"];
const UPKEEP_TEXT = "At the beginning of your upkeep, exile the top card of your library. You may play that card this turn.";
const END_TEXT =
  "At the beginning of your end step, if you've sacrificed two or more permanents this turn, you may transform Magik.";

export default defineCard({
  name: "Magik, Illyana Rasputin",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Sorcerer", "Hero"],
  power: 3,
  toughness: 3,
  text: `${UPKEEP_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "sacrificed", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "may", prompt: "Transform Magik?", effect: { kind: "transform", target: "source" } },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: FACES,
});
