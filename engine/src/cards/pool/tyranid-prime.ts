import { defineCard } from "../define.js";
import { evolve } from "../helpers.js";

// EDHREC rank 10251.
//
// Its own evolve is the `evolve()` helper; Synapse Creature grants the same
// ability to every other creature you control (Propagator Drone's
// `grantsTriggered` shape, with "other" as `excludeSelf`).

const SYNAPSE_TEXT = "Synapse Creature — Other creatures you control have evolve.";

export default defineCard({
  name: "Tyranid Prime",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 0,
  toughness: 4,
  text: `Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\n${SYNAPSE_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantsTriggered: [evolve()],
      text: SYNAPSE_TEXT,
    },
  ],
  triggered: [evolve()],
});
