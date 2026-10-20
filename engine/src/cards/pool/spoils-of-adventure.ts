import { defineCard } from "../define.js";

// EDHREC rank 12764. Zendikar Rising. Deadly Alliance's party cost reduction.

export default defineCard({
  name: "Spoils of Adventure",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  text: "This spell costs {1} less to cast for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nYou gain 3 life and draw three cards.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 3 },
      { kind: "draw", amount: 3 },
    ],
  },
});
