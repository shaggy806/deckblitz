import { defineCard } from "../define.js";

// EDHREC rank 16441.
//
// "Lesser power" is read against this creature's power as the target is
// chosen and again as the ability resolves; after that the creature's power
// no longer matters (the ruling). With no target chosen the Ring still tempts
// you; with a target chosen that's illegal by then, the ability doesn't
// resolve and the Ring doesn't tempt you (rule 608.2b, the rulings).

const ENTERS_TEXT =
  "When this creature enters, gain control of up to one target creature with lesser power for as long as you control this creature. Then the Ring tempts you.";

export default defineCard({
  name: "Rangers of Ithilien",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
          { kind: "the-ring-tempts-you" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
