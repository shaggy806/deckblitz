import { defineCard } from "../define.js";

// EDHREC rank 10718. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] Normally, a creature's base power and toughness are the power and toughness
//     printed on the card or, for a token, the power and toughness set by the effect that created
//     it. If another effect sets a creature's power and toughness to specific numbers or values,
//     those become its base power and toughness. If an effect modifies a creature's power and/or
//     toughness without setting them, that is not included when determining its base power and
//     toughness.
//   [2022-04-29] If a creature has a characteristic-defining ability that sets its power and
//     toughness, indicated with a */* or similar in the power and toughness box, that ability is
//     taken into account when determining its base power and toughness.
//
// `basePower`/`baseToughness` read the base values (counters and pumps
// aside — Duskana's filter). One trigger per batch of entering 1/1s. The
// pump's X is read as the attack trigger resolves, and the creatures it
// affects are the ones matching then.
const ENTER_TEXT =
  "Whenever one or more other creatures you control with base power and toughness 1/1 enter, put a +1/+1 counter on Bess.";
const ATTACK_TEXT =
  "Whenever Bess attacks, each other creature you control with base power and toughness 1/1 gets +X/+X until end of turn, where X is the number of +1/+1 counters on Bess.";

const ONE_ONE = { basePower: { op: "eq", n: 1 }, baseToughness: { op: "eq", n: 1 } } as const;
const X = { countersOn: "source", counter: "+1/+1" } as const;

export default defineCard({
  name: "Bess, Soul Nourisher",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", ...ONE_ONE },
        otherOnly: true,
        batched: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", ...ONE_ONE },
        power: X,
        toughness: X,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
