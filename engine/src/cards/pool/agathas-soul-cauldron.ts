import { defineCard } from "../define.js";

// The cards are linked to this artifact (rule 607.2a) and any card may be
// exiled; only the creature cards pass on their abilities, and only they make
// the reflexive ability trigger (rule 603.12).
const SPEND_TEXT = "You may spend mana as though it were mana of any color to activate abilities of creatures you control.";
const GRANT_TEXT =
  "Creatures you control with +1/+1 counters on them have all activated abilities of all creature cards exiled with Agatha's Soul Cauldron.";
const EXILE_TEXT =
  "{T}: Exile target card from a graveyard. When a creature card is exiled this way, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Agatha's Soul Cauldron",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${SPEND_TEXT}\n${GRANT_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: {
              kind: "reflexive-trigger",
              text: "When a creature card is exiled this way, put a +1/+1 counter on target creature you control.",
              targets: ["creature-you-control"],
              effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", activatingOf: { type: "creature", controlledBy: "you" } },
      text: SPEND_TEXT,
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantsActivatedOf: { zone: "exiled-with", filter: { type: "creature" } },
      text: GRANT_TEXT,
    },
  ],
});
