import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 14668. "If it had power greater than Drizzt's power" is an
// intervening-if (rule 603.4), checked as the creature dies (the trigger's
// filter, the creature as it last existed — 603.10a) and again as the ability
// resolves (the `conditional`), as the ruling says: of several bigger creatures
// dying at once, a later trigger may find Drizzt already grown past them.
const ENTER_TEXT = "When Drizzt enters, create Guenhwyvar, a legendary 4/1 green Cat creature token with trample.";
const DIES_TEXT =
  "Whenever a creature dies, if it had power greater than Drizzt's power, put a number of +1/+1 counters on Drizzt equal to the difference.";
const BIGGER: CardFilter = { type: "creature", power: { op: "gt", n: { amount: { powerOf: "source" } } } };

export default defineCard({
  name: "Drizzt Do'Urden",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Ranger"],
  power: 3,
  toughness: 3,
  keywords: ["double-strike"],
  text: `Double strike\n${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Guenhwyvar", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: BIGGER },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: BIGGER },
        then: {
          kind: "add-counter",
          target: "source",
          counter: "+1/+1",
          amount: { difference: [{ powerOf: "trigger-object" }, { powerOf: "source" }] },
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
