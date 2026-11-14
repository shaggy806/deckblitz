import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 17094.
//
// - The card exiled from hand gains two abilities that work only in exile
//   (rule 113.6k, Cosima's `fromExile` and `grant-triggered`): "your" upkeep is
//   its owner's, who controls it there. The counters are refine counters
//   (Oracle's word now; the rulings still say hone).
// - Off the last counter, casting it is optional and ignores its type's timing;
//   a card not cast stays exiled with no counters, out of reach for good (the
//   ruling). The {4} off is generic only (the ruling): `cast-now`'s `reduce`.

const UPKEEP_TEXT = "At the beginning of your upkeep, if this card is exiled, remove a refine counter from it.";
const LAST_TEXT =
  "When the last refine counter is removed from this card, if it's exiled, you may cast it. It costs {4} less to cast this way.";
const TAP_TEXT = `{T}: You may exile an instant or sorcery card from your hand and put three refine counters on it. It gains "${UPKEEP_TEXT}" and "${LAST_TEXT}"`;

const UPKEEP: TriggeredAbility = {
  fromExile: true,
  trigger: { on: "step-begins", step: "upkeep", who: "you" },
  condition: { kind: "source-zone", zones: ["exile"], sameObject: true },
  targets: [],
  effect: { kind: "remove-counter", target: "source", counter: "refine", amount: 1 },
  resolve: null,
  text: UPKEEP_TEXT,
};

const LAST: TriggeredAbility = {
  fromExile: true,
  trigger: { on: "counters-removed", who: "self", counter: "refine", last: true },
  condition: { kind: "source-zone", zones: ["exile"], sameObject: true },
  targets: [],
  effect: { kind: "cast-now", target: "source", reduce: 4 },
  resolve: null,
  text: LAST_TEXT,
};

export default defineCard({
  name: "Uvilda, Dean of Perfection",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Djinn", "Wizard"],
  power: 2,
  toughness: 2,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            filter: { typesAnyOf: ["instant", "sorcery"] },
            min: 0,
            max: 1,
            destination: "exile",
            unlinked: true,
            leftover: "stay",
          },
          { kind: "add-counter", target: { thisWay: "exiled" }, counter: "refine", amount: 3 },
          { kind: "grant-triggered", target: { thisWay: "exiled" }, ability: UPKEEP, duration: "permanent" },
          { kind: "grant-triggered", target: { thisWay: "exiled" }, ability: LAST, duration: "permanent" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  faces: ["Uvilda, Dean of Perfection", "Nassari, Dean of Expression"],
});
