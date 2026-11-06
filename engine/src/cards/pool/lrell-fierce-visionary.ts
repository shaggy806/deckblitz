import { defineCard } from "../define.js";

// EDHREC rank 30366.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, create a 2/1 red Klingon Warrior creature token with haste. Sacrifice it at the beginning of the next end step.";
const SURVEIL_TEXT = "{2}, Sacrifice another creature or artifact: Surveil 1.";

export default defineCard({
  name: "L'Rell, Fierce Visionary",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 1,
  toughness: 4,
  text: `${COMBAT_TEXT}\n${SURVEIL_TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Klingon Warrior Token", count: 1, sacrificeAtEndStep: true },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } } },
      otherOnly: true,
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
