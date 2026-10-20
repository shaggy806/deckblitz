import { defineCard } from "../define.js";

const EXILE =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Journey to Oblivion",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  text: `This spell costs {1} less to cast for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\n${EXILE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE,
    },
  ],
});
