import { defineCard } from "../define.js";

// EDHREC rank 9442.
//
// Rulings:
//   [2023-06-16] "Do this only once each turn" lets you choose whether or not to untap Legolas as
//     the triggered ability resolves. If you don't untap it, the ability will trigger again the
//     next time the condition is met. Once you choose to do so, the ability will no longer trigger
//     for the rest of the turn.
//
// "If Legolas is tapped" is an intervening-if (rule 603.4) on the source;
// "do this only once each turn" is the `may`'s `oncePerTurn` (Pantlaza,
// Leonardo): a declined untap doesn't use it up (the ruling).

const SCRY_TEXT = "Whenever you scry, if Legolas is tapped, you may untap it. Do this only once each turn.";

export default defineCard({
  name: "Legolas, Counter of Kills",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${SCRY_TEXT}\nWhenever a creature an opponent controls dies, put a +1/+1 counter on Legolas.`,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      condition: { kind: "source", filter: { tapped: true } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Legolas?",
        oncePerTurn: true,
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: SCRY_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature an opponent controls dies, put a +1/+1 counter on Legolas.",
    },
  ],
});
