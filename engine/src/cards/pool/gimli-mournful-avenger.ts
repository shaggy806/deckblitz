import { defineCard } from "../define.js";

// EDHREC rank 15086.
//
// "Died under your control this turn" counts creatures that died before Gimli
// was on the battlefield too (its ruling). The fight is a reflexive ability
// (rule 603.12) the counter ability sets off as it resolves for the third time
// this turn — its target is chosen then, not as the counter ability triggers
// (its ruling). Gimli coming back is a new object (rule 400.7), counting anew.
const INDESTRUCTIBLE =
  "Gimli has indestructible as long as two or more creatures died under your control this turn.";
const COUNTER =
  "Whenever another creature you control dies, put a +1/+1 counter on Gimli. When this ability resolves " +
  "for the third time this turn, Gimli fights up to one target creature you don't control.";

export default defineCard({
  name: "Gimli, Mournful Avenger",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${INDESTRUCTIBLE}\n${COUNTER}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "died", who: "you", filter: { type: "creature" }, atLeast: 2 },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 3 },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
              effect: { kind: "fight", a: "source", b: 0 },
              text: "Gimli fights up to one target creature you don't control.",
            },
          },
        ],
      },
      resolve: null,
      text: COUNTER,
    },
  ],
});
