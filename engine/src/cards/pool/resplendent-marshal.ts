import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// "When you do" is a reflexive ability (rule 603.12) that resolves on its
// own, after this one: "the exiled card" is what this one exiled, remembered
// as the reflexive ability triggers (`remember`), and "shares a creature type
// with" reads that card as it is in exile.
const TEXT =
  "When this creature enters or dies, you may exile another creature card from your graveyard. When you do, put a +1/+1 counter on each creature you control other than this creature that shares a creature type with the exiled card.";
const WHEN_YOU_DO =
  "When you do, put a +1/+1 counter on each creature you control other than this creature that shares a creature type with the exiled card.";

const exileAnother = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "graveyard",
        filter: { type: "creature", isSource: false },
        min: 0,
        max: 1,
        destination: "exile",
        leftover: "stay",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled" },
        then: {
          kind: "reflexive-trigger",
          targets: [],
          remember: { exiled: { set: { thisWay: "exiled" } } },
          effect: {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you", sharesCreatureTypeWith: { remembered: "exiled" } },
            counter: "+1/+1",
            amount: 1,
            exceptSource: true,
          },
          text: WHEN_YOU_DO,
        },
      },
    ],
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Resplendent Marshal",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [exileAnother({ on: "enters-battlefield", who: "self" }), exileAnother({ on: "dies", who: "self" })],
});
