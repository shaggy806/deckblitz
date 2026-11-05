import { defineCard } from "../define.js";

// Milling two isn't offered with fewer than two cards in the library (rule
// 701.17b), so then it's sacrificed. "Your next untap step" is the
// activator's (`untapStepOf: "you"`).

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this creature unless you mill two cards.";
const SHROUD_TEXT =
  "{U}: This creature gains shroud until end of turn and doesn't untap during your next untap step. Tap this creature.";

export default defineCard({
  name: "Deep Spawn",
  manaCost: "{5}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homarid"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${UPKEEP_TEXT}\n${SHROUD_TEXT} (A creature with shroud can't be the target of spells or abilities.)`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
          { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true, untapStepOf: "you" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: SHROUD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ doing: { kind: "mill", target: "you", amount: 2 }, text: "Mill two cards" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
