import { defineCard } from "../define.js";

// The second mode targets nothing: the creature is chosen as the spell resolves,
// after the first mode, so the creature just gained can be the one copied (the
// rulings). Whether both modes may be chosen is read as the spell is cast.

export default defineCard({
  name: "Sakashima's Will",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• Target opponent chooses a creature they control. You gain control of it.\n• Choose a creature you control. Each other creature you control becomes a copy of that creature until end of turn.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: "Target opponent chooses a creature they control. You gain control of it.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "vote",
              choose: true,
              who: { target: 0 },
              for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
            },
            {
              kind: "for-each-voted",
              which: "voted",
              effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
            },
          ],
        },
      },
      {
        text: "Choose a creature you control. Each other creature you control becomes a copy of that creature until end of turn.",
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          min: 1,
          upTo: 1,
          prompt: "Choose a creature you control. Each other creature you control becomes a copy of it until end of turn.",
          then: {
            kind: "become-copy",
            filter: { type: "creature", controlledBy: "you" },
            exceptOf: true,
            of: 0,
            until: "end-of-turn",
          },
        },
      },
    ],
  },
});
