import { defineCard } from "../define.js";

// EDHREC rank 14792.
//
// Base power and toughness set in layer 7b (Quandrix Charm's `animate` with
// no types), so counters and pumps still apply on top (the ruling). The six
// lands are counted as it resolves.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, target creature has base power and toughness 3/3 until end of turn. If you control six or more lands, that creature has base power and toughness 6/6 until end of turn instead.";

const base = (n: number) =>
  ({ kind: "animate", target: 0, power: n, toughness: n, addTypes: [], addSubtypes: [], duration: "end-of-turn" }) as const;

export default defineCard({
  name: "Genemorph Imago",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 6 },
        then: base(6),
        else: base(3),
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
