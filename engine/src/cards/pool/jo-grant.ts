import { defineCard } from "../define.js";

// Historic (rule 700.6): artifacts, legendaries and Sagas.

const CYCLING_TEXT = "Each historic card in your hand has cycling {2}{W}. ({2}{W}, Discard that card: Draw a card.)";
const CYCLE_TEXT = "Whenever you cycle a card, put a +1/+1 counter on Jo Grant.";

export default defineCard({
  name: "Jo Grant",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${CYCLING_TEXT}\n${CYCLE_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  static: [
    {
      affects: { scope: "self" },
      grantsCyclingInHand: {
        cost: "{2}{W}",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      text: CYCLING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cycles", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
