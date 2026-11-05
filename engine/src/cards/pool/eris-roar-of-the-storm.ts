import { defineCard } from "../define.js";

const COST = "This spell costs {2} less to cast for each different mana value among instant and sorcery cards in your graveyard.";
const PROWESS = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const TOKEN = "Whenever you cast your second spell each turn, create a 4/4 red Dragon Elemental creature token with flying and prowess.";

export default defineCard({
  name: "Eris, Roar of the Storm",
  manaCost: "{8}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Warlock"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `${COST}\nFlying, prowess\n${TOKEN}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      scaled: {
        aggregate: "distinct",
        of: "mana-value",
        filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
        in: "graveyards",
      },
      by: 2,
    },
  },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS,
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Elemental Token", count: 1 },
      resolve: null,
      text: TOKEN,
    },
  ],
});
