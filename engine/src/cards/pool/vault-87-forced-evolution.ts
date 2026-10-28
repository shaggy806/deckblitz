import { defineCard } from "../define.js";

// EDHREC rank 11336. Chapter I's control lasts for as long as you control
// this Saga, and never begins if it has left before the chapter resolves (the
// ruling, rule 611.2b); the creature becoming a Mutant later doesn't end it.
// Chapter III reads the greatest power as it resolves (the ruling).
const CHAPTER_I = "I — Gain control of target non-Mutant creature for as long as you control this Saga.";
const CHAPTER_II = "II — Put a +1/+1 counter on target creature you control. It becomes a Mutant in addition to its other types.";
const CHAPTER_III = "III — Draw cards equal to the greatest power among Mutants you control.";

export default defineCard({
  name: "Vault 87: Forced Evolution",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Mutant"] } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-types", target: 0, addSubtypes: ["Mutant"], duration: "permanent" },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "draw",
        amount: { aggregate: "max", of: "power", filter: { type: "creature", subtype: "Mutant", controlledBy: "you" } },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
