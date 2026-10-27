import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 30843.
//
// Ruling: setting up the regeneration shield doesn't remove it from combat;
// only a regeneration that replaces a destruction does (rule 701.15a).

export default defineCard({
  name: "Duskworker",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature becomes blocked, regenerate it.\n{3}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{3}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Whenever this creature becomes blocked, regenerate it.",
    },
  ],
});
