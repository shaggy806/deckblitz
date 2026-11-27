import { defineCard } from "../define.js";

// Each magecraft resolution grants both abilities again: a creature that
// gained them twice is exiled once (the replacement applies once — rule
// 614.5) and both "When this creature is put into exile" instances trigger
// (the reminder text). The trigger is a leaves-the-battlefield ability of the
// creature, looking back at it as it was (rule 603.10a).

const TEXT =
  'Magecraft — Whenever you cast or copy an instant or sorcery spell, choose target creature you control. Until end of turn, it gains "If this creature would leave the battlefield, exile it instead of putting it anywhere else" and "When this creature is put into exile, create a 4/4 blue and red Elemental creature token." (Each instance of that ability triggers separately.)';

export default defineCard({
  name: "Elemental Expressionist",
  manaCost: "{U/R}{U/R}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Wizard"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-static",
            target: 0,
            duration: "end-of-turn",
            ability: {
              affects: { scope: "self" },
              exileIfLeaves: true,
              text: "If this creature would leave the battlefield, exile it instead of putting it anywhere else.",
            },
          },
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "leaves-battlefield", who: "self", to: ["exile"] },
              targets: [],
              effect: { kind: "create-token", token: "4/4 Blue Red Elemental Token", count: 1 },
              resolve: null,
              text: "When this creature is put into exile, create a 4/4 blue and red Elemental creature token.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
