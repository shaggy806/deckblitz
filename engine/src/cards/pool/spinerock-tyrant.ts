import { defineCard } from "../define.js";

// "With a single target" counts the targets chosen as the spell was cast (rule 115.9a): one
// object chosen twice is two. Wither on a spell is its damage dealt as -1/-1 counters to
// creatures (rule 702.80). The copy gains wither as it's made (`gains`), and the spell copied
// gains it too while it's still that spell on the stack (`alsoOriginal`) — only if a copy was
// made ("if you do").

const TRIGGER_TEXT =
  "Whenever you cast an instant or sorcery spell with a single target, you may copy it. If you do, those spells gain wither. You may choose new targets for the copy.";

export default defineCard({
  name: "Spinerock Tyrant",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "wither"],
  text: `Flying\nWither (This deals damage to creatures in the form of -1/-1 counters.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { count: 1 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell? (Both gain wither.)",
        effect: {
          kind: "copy-spell",
          target: "trigger-spell",
          newTargets: true,
          gains: { keywords: ["wither"], alsoOriginal: true },
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
