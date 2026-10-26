import { defineCard } from "../define.js";

// EDHREC rank 16414.
//
// Rulings:
//   [2008-05-01] You put the -1/-1 counter on Barrenton Medic as a cost. That means it happens
//     when you activate the ability, not when it resolves. If paying the cost causes the creature
//     to have 0 toughness, it's put into the graveyard before you can untap it and before you can
//     even pay the cost again.

const PREVENT_TEXT = "{T}: Prevent the next 1 damage that would be dealt to any target this turn.";
const UNTAP_TEXT = "Put a -1/-1 counter on this creature: Untap this creature.";

export default defineCard({
  name: "Barrenton Medic",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Cleric"],
  power: 0,
  toughness: 4,
  text: `${PREVENT_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: PREVENT_TEXT,
    },
    {
      // Devoted Druid's shape: the counter is the cost.
      cost: { mana: null, tap: false, addCounter: { kind: "-1/-1", count: 1 } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
