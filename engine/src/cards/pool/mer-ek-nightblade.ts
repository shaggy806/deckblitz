import { defineCard } from "../define.js";
import { outlast } from "../helpers.js";

// EDHREC rank 12989. Khans of Tarkir.

const DEATHTOUCH_TEXT = "Each creature you control with a +1/+1 counter on it has deathtouch.";

export default defineCard({
  name: "Mer-Ek Nightblade",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Assassin"],
  power: 2,
  toughness: 3,
  text: `Outlast {B} ({B}, {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)\n${DEATHTOUCH_TEXT}`,
  activated: [outlast("{B}")],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH_TEXT,
    },
  ],
});
