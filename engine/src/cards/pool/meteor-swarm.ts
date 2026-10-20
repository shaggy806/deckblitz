import { defineCard } from "../define.js";

// EDHREC rank 14925. Exactly X targets, the 8 divided as it's cast with at least 1 each, so X
// can't be more than 8 (its ruling, rule 601.2d); a target gone illegal loses its share and the
// rest keep theirs (its other ruling).
export default defineCard({
  name: "Meteor Swarm",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Meteor Swarm deals 8 damage divided as you choose among X target creatures and/or planeswalkers.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      min: "x",
      max: "x",
    },
  ],
  divided: { total: 8, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
