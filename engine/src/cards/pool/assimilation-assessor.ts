import { defineCard } from "../define.js";
import { ASSIMILATE } from "../helpers.js";

const ENTERS_TEXT = "When this creature enters, exile target opponent's graveyard.";
const ATTACKS_TEXT =
  "Whenever this creature attacks, assimilate a creature card exiled with it. (Put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)";

export default defineCard({
  name: "Assimilation Assessor",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 5,
  toughness: 5,
  text: `${ENTERS_TEXT}\n${ATTACKS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      // Linked (rule 607.2a): the attack trigger's "exiled with it".
      effect: { kind: "exile-graveyard", target: 0, linked: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        ...ASSIMILATE,
        leftover: "stay",
      },
      resolve: null,
      text: ATTACKS_TEXT,
    },
  ],
});
