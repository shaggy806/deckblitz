import { defineCard } from "../define.js";

const COPY_TEXT =
  "{4}{U}: This land becomes a copy of target creature you control until end of turn, except it isn't legendary and it's a Robot artifact in addition to its other types.";

export default defineCard({
  name: "Shore Leave Planet",
  colors: [],
  types: ["land"],
  subtypes: ["Planet"],
  text: `This land enters tapped.\n{T}: Add {U}.\n${COPY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "end-of-turn",
        exceptions: { notLegendary: true, addTypes: ["artifact"], addSubtypes: ["Robot"] },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
