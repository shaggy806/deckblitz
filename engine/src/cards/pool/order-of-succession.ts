import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 17112.
//
// The direction is chosen as it resolves (a `modal` with one mode each way, as
// Aminatou's −6). Then, starting with you and going round the table that way
// (`vote` `choose`, `startingWith: "you"`, `proceeding`), each player chooses
// a creature controlled by the next player in that direction — no targets, so
// protection doesn't stop it (the ruling), each choice made knowing the ones
// before it (rule 101.4), nothing chosen with no creature there (the ruling).
// Then each player gains control of the creature they chose, all at once (the
// ruling): every chosen creature is controlled by the next player in the
// direction from the one who chose it, which is `rotate-control` that way over
// `{ thisWay: "chosen" }`.

const TEXT =
  "Choose left or right. Starting with you and proceeding in the chosen direction, each player chooses a creature controlled by the next player in that direction. Each player gains control of the creature they chose.";

const succession = (direction: "left" | "right"): EffectSpec => ({
  kind: "sequence",
  effects: [
    {
      kind: "vote",
      choose: true,
      startingWith: "you",
      proceeding: direction,
      for: {
        permanent: {
          type: "creature",
          controlledBy: direction === "left" ? "player-to-your-left" : "player-to-your-right",
        },
        own: true,
        prompt: `Choose a creature controlled by the player to your ${direction} to gain control of`,
      },
    },
    { kind: "rotate-control", direction, filter: { thisWay: "chosen" } },
  ],
});

export default defineCard({
  name: "Order of Succession",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Left — each player takes a creature of the next player in turn order",
        effect: succession("left"),
      },
      {
        text: "Right — each player takes a creature of the previous player in turn order",
        effect: succession("right"),
      },
    ],
  },
});
