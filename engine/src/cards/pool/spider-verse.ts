import { defineCard } from "../define.js";

// EDHREC rank 7790. "Do this only once each turn" counts only a copy made: a
// declined one leaves it open (the `may`'s `oncePerTurn`, Cosmic Crucible's shape).

const TEXT =
  "Whenever you cast a spell from anywhere other than your hand, you may copy it. If you do, you may choose new targets for the copy. If the copy is a permanent spell, it gains haste. Do this only once each turn.";

export default defineCard({
  name: "Spider-Verse",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `The "legend rule" doesn't apply to Spiders you control.\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Spider", controlledBy: "you" } },
      legendRuleOff: true,
      text: "The \"legend rule\" doesn't apply to Spiders you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell?",
        oncePerTurn: true,
        effect: {
          kind: "copy-spell",
          target: "trigger-spell",
          newTargets: true,
          gains: { keywords: ["haste"], ifPermanent: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
