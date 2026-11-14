import { defineCard } from "../define.js";

// EDHREC rank 26968. Bonded Construct's restriction, gated on no +1/+1
// counter on him.
const TEXT = "Pipsqueak can't attack alone unless he has a +1/+1 counter on him.";

export default defineCard({
  name: "Pipsqueak, Rebel Strongarm",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "source", filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      },
      restrictions: ["cant-attack-alone"],
      text: TEXT,
    },
  ],
});
