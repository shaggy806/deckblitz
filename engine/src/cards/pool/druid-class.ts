import { atLevel, classLevel } from "../helpers.js";
import { defineCard } from "../define.js";

// A Class (rule 716). Level 3's land stays a creature after the Class has gone:
// the effect doesn't depend on it.
const LEVEL_3 =
  'When this Class becomes level 3, target land you control becomes a creature with haste and "This creature\'s power and toughness are each equal to the number of lands you control." It\'s still a land.';

export default defineCard({
  name: "Druid Class",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\nLandfall — Whenever a land you control enters, you gain 1 life.\n{2}{G}: Level 2\nYou may play an additional land on each of your turns.\n{4}{G}: Level 3\n${LEVEL_3}`,
  static: [
    atLevel(2, { affects: { scope: "self" }, extraLandsPerTurn: 1, text: "You may play an additional land on each of your turns." }),
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you gain 1 life.",
    },
    atLevel(3, {
      trigger: { on: "class-level-gained", who: "self", level: 3 },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "land" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "animate", target: 0, addTypes: ["creature"], addSubtypes: [], keywords: ["haste"], duration: "permanent" },
          {
            kind: "grant-static",
            target: 0,
            ability: {
              affects: { scope: "self" },
              setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
              text: "This creature's power and toughness are each equal to the number of lands you control.",
            },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: LEVEL_3,
    }),
  ],
  activated: [classLevel(2, "{2}{G}"), classLevel(3, "{4}{G}")],
});
