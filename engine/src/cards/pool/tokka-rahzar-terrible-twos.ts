import { defineCard } from "../define.js";

// EDHREC rank 19152.
//
// The intervening-if (rule 603.4) is a `cast-spell` filter comparing the mana
// spent on the spell with its own mana value (`{ own: "manaValue" }` — on the
// stack, {X} counts as the value chosen, the ruling). Neither number changes
// once the spell is cast, so the check as it resolves agrees with the one as
// it triggered. A copy isn't cast, so it never triggers this. "That player" is
// the spell's caster (`trigger-controller`, Spellshock's shape).

const TRIGGER_TEXT =
  "Whenever a player casts a spell, if the amount of mana spent to cast it was less than its mana value, Tokka & Rahzar deal 3 damage to that player.";

export default defineCard({
  name: "Tokka & Rahzar, Terrible Twos",
  manaCost: "{B/R}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Turtle", "Wolf", "Mutant"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nMenace\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { manaSpent: { op: "lt", n: { own: "manaValue" } } } },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
