import { defineCard } from "../define.js";

// Alliances. EDHREC rank 31797.
//
// Rulings:
//   [2004-10-04] The ability triggers on declaration of blockers if the criteria is met.
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it. It will trigger even if that creature was put
//     onto the battlefield attacking rather than having been declared as an attacker in the
//     declare attackers step.
//
// Guiltfeeder's trigger (the defending player is the `trigger-player`) and
// Floral Spuzzem's "assigns no combat damage this turn".

const TEXT =
  "Whenever this creature attacks and isn't blocked, it assigns no combat damage this turn and defending player loses 2 life.";

export default defineCard({
  name: "Keeper of Tresserhorn",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "assigns-no-combat-damage", target: "source" },
          { kind: "lose-life", who: "trigger-player", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
