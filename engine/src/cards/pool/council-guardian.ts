import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 18393.
//
// Will of the council (rule 701.38): the vote is a named-option `vote`, and
// "each color with the most votes or tied for most votes" is `vote-won`'s
// `orTied` for each color — no other color got more, and at least one vote
// (a color nobody voted for isn't tied for most). The protection lasts as
// long as this permanent does (`duration: "permanent"`). Gone before the
// ability resolves, the vote still happens and does nothing (its ruling).

const TEXT =
  "Will of the council — When this creature enters, starting with you, each player votes for blue, black, red, or green. This creature gains protection from each color with the most votes or tied for most votes.";

const COLORS = ["U", "B", "R", "G"] as const;

export default defineCard({
  name: "Council Guardian",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["blue", "black", "red", "green"] } },
          ...COLORS.map(
            (color, option): EffectSpec => ({
              kind: "conditional",
              condition: { kind: "vote-won", option, orTied: true },
              then: { kind: "grant-protection", target: "source", from: { colors: [color] }, duration: "permanent" },
            }),
          ),
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
