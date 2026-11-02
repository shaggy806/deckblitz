import { defineCard } from "../define.js";

const PROWESS = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const ENTERS = "When this creature enters, scry 2.";

export default defineCard({
  name: "Stormwing Entity",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "cast-this-turn", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
    reduceGeneric: 2,
    reduceColored: "{U}",
  },
  text: `This spell costs {2}{U} less to cast if you've cast an instant or sorcery spell this turn.\nFlying\n${PROWESS}\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
