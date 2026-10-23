import { defineCard } from "../define.js";

// EDHREC rank 10733. The tap trigger needs an actual change from untapped to
// tapped (the ruling — `becomes-tapped`). X is chosen as the `may`'s cost is
// paid; every Dwarf and Vehicle card among the X revealed goes to hand
// (min = max = X, as many as there are), the rest to the bottom at random.
const DWARVES = "Other Dwarves you control get +1/+1.";
const VEHICLES = "Each Vehicle you control gets +1/+1 as long as it's a creature.";
const TAPPED =
  "Whenever Depala becomes tapped, you may pay {X}. If you do, reveal the top X cards of your library, put all Dwarf and Vehicle cards from among them into your hand, then put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Depala, Pilot Exemplar",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Pilot"],
  power: 3,
  toughness: 3,
  text: `${DWARVES}\n${VEHICLES}\n${TAPPED}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Dwarf" },
      grantPt: [1, 1],
      text: DWARVES,
    },
    {
      affects: { scope: "filter", filter: { subtype: "Vehicle", type: "creature", controlledBy: "you" } },
      grantPt: [1, 1],
      text: VEHICLES,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to reveal the top X cards and take the Dwarf and Vehicle cards?",
        cost: "{X}",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: "x",
          reveal: true,
          min: "x",
          max: "x",
          filter: { subtypes: ["Dwarf", "Vehicle"] },
          destination: "hand",
          leftover: "bottom-random",
        },
      },
      resolve: null,
      text: TAPPED,
    },
  ],
});
