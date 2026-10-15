import { defineCard } from "../define.js";

// EDHREC rank 24219.
//
// "If you've cast a noncreature spell this turn": read as Traxos is cast,
// over the spells its caster cast earlier this turn (Focus the Mind's shape;
// Traxos itself is a creature spell, so it never counts).
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";

export default defineCard({
  name: "Traxos, Academy Guardian",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Dragon", "Construct"],
  power: 1,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `This spell costs {2} less to cast if you've cast a noncreature spell this turn.\nFlying, vigilance\n${PROWESS_TEXT}`,
  selfCostReduction: {
    condition: { kind: "cast-this-turn", who: "you", filter: { notTypes: ["creature"] } },
    reduceGeneric: 2,
  },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
});
