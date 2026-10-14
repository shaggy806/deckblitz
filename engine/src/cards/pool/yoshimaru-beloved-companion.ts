import { defineCard } from "../define.js";

// EDHREC rank 16948.

export default defineCard({
  name: "Yoshimaru, Beloved Companion",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.\n{6}: Put a +1/+1 counter on target legendary creature.",
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [{ kind: "permanent", filter: { supertype: "legendary", type: "creature" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{6}: Put a +1/+1 counter on target legendary creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { type: "creature" } },
      text: "If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.",
    },
  ],
});
