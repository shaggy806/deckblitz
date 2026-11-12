import { defineCard } from "../define.js";

// "Do this only once each turn" limits the cast, not the trigger (its
// rulings): the ability triggers on every loss, and only a cast spends the
// turn's use (`marksAbilityDone`, read on resolution). The card is cast as it
// resolves, timing ignored, with the first ability's reduction applying.
const COST_TEXT = "Spells you cast from your graveyard cost {2} less to cast.";
const TRIGGER_TEXT =
  "Whenever one or more opponents lose life, you may cast target instant or sorcery card from your graveyard. " +
  "If that spell would be put into your graveyard, exile it instead. Do this only once each turn.";

export default defineCard({
  name: "Emet-Selch of the Third Seat",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Wizard"],
  power: 3,
  toughness: 4,
  text: `${COST_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 2, when: { caster: "you", castFrom: "graveyard" } },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "loses-life", who: "opponent", batched: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "this-ability-did-this-turn" } },
        then: { kind: "cast-now", target: 0, exileAfter: true, marksAbilityDone: true },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
