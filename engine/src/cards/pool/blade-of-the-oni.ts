import { defineCard } from "../define.js";

// Reconfigure (rule 702.151): the attach/unattach pair, as Acquisition
// Octopus's; "while attached, this isn't a creature" comes with `reconfigure`.
const EQUIPPED =
  "Equipped creature has base power and toughness 5/5, has menace, and is a black Demon in addition to its other colors and types.";

export default defineCard({
  name: "Blade of the Oni",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Demon"],
  power: 3,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${EQUIPPED}\nReconfigure {2}{B}{B} ({2}{B}{B}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)`,
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {2}{B}{B}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{2}{B}{B}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {2}{B}{B}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["menace"],
      addColors: ["B"],
      addSubtypes: ["Demon"],
      text: EQUIPPED,
    },
  ],
});
