import { defineCard } from "../define.js";

// Rulings:
//   Any +1/+1 counter which is on this card can be turned into a Tetravite token. It does not
//     care where the +1/+1 counter came from.
//   If the Tetravus is destroyed when the Tetravites are off the card, they are not destroyed,
//     they are just orphaned.
//   Only Tetravites from this specific Tetravus may be used for the ability. Ones from a
//     different Tetravus can't.
//   This card now has two upkeep-triggered abilities. Its controller chooses the order they are
//     put on the stack, and thus the order in which they resolve each upkeep.
//
// "You may remove any number": `remove-counters`' `count: "any"` (none is a choice), and
// "that many" is what came off (`thisWay: "counters-removed"`). The Tetravites are linked to this
// creature as they're made (`linkedToSource`, in the stint it's in), so "tokens created with
// this creature" is `createdWithSource` (Dual Nature's filter): chosen as the second trigger
// resolves and exiled together (`choose-permanents`), "that many" being how many were exiled.
const SPLIT =
  "At the beginning of your upkeep, you may remove any number of +1/+1 counters from this creature. If you do, create that many 1/1 colorless Tetravite artifact creature tokens. They each have flying and \"This token can't be enchanted.\"";
const MERGE =
  "At the beginning of your upkeep, you may exile any number of tokens created with this creature. If you do, put that many +1/+1 counters on this creature.";
const ENTERS = "This creature enters with three +1/+1 counters on it.";
const MINE = { token: true, createdWithSource: true } as const;

export default defineCard({
  name: "Tetravus",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}\n${SPLIT}\n${MERGE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: ENTERS,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counters", target: "source", counter: "+1/+1", count: "any" },
          {
            kind: "create-token",
            token: "Tetravite Token",
            count: { thisWay: "counters-removed" },
            linkedToSource: true,
          },
        ],
      },
      resolve: null,
      text: SPLIT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: MINE,
            upTo: { countOf: MINE },
            then: { kind: "exile", target: 0 },
            prompt: "Exile any number of tokens created with Tetravus",
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { thisWay: "exiled" } },
        ],
      },
      resolve: null,
      text: MERGE,
    },
  ],
});
