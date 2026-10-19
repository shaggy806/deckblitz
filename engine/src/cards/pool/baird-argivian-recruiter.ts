import { defineCard } from "../define.js";

// EDHREC rank 8759.
//
// Rulings:
//   Some creatures have base power and toughness 0/0 and an ability that gives them a bonus
//     based on some criteria. Those are not characteristic-defining abilities, and that ability
//     doesn't change its base power and toughness.
//   If a creature has a characteristic-defining ability that sets its power and toughness,
//     indicated with a */* or similar in the power and toughness box, that ability is taken into
//     account when determining its base power and toughness.
//   Normally, a creature's base power and toughness are the power and toughness printed on the
//     card or, for a token, the power and toughness set by the effect that created it. If
//     another effect sets a creature's power and toughness to specific numbers or values, those
//     become its base power and toughness. If an effect modifies a creature's power and/or
//     toughness without setting them, that is not included when determining its base power and
//     toughness.
//
// Kutzil's "power greater than its base power" filter: its power now against
// its own base power (printed, set, or a CDA's). An intervening-if, checked as
// the step begins and again as the trigger resolves (rule 603.4).
const TEXT =
  "At the beginning of your end step, if you control a creature with power greater than its base power, create a 1/1 white Soldier creature token.";

export default defineCard({
  name: "Baird, Argivian Recruiter",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gt", n: { own: "basePower" } } },
        atLeast: 1,
      },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
