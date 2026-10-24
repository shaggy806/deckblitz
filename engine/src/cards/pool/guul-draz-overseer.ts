import { defineCard } from "../define.js";

// EDHREC rank 20365.
//
// Oran-Rief Hydra's "if that land is a [type] … instead" shape: the land
// that fired the trigger, as it last existed if it has left.
const TEXT =
  "Landfall — Whenever a land you control enters, other creatures you control get +1/+0 until end of turn. If that land is a Swamp, those creatures get +2/+0 until end of turn instead.";

const pump = (power: number) =>
  ({
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power,
    toughness: 0,
    duration: "end-of-turn",
    exceptSource: true,
  }) as const;

export default defineCard({
  name: "Guul Draz Overseer",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { subtype: "Swamp" } },
        then: pump(2),
        else: pump(1),
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
