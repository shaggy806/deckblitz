import { defineCard } from "../define.js";

// One replacement (rule 614.1c): its controller chooses the permanents as it's
// about to enter (614.12), their counters come off then, and it enters with two
// +1/+1 counters for each counter removed (`AsEntersAction.removeCounters`).
export default defineCard({
  name: "Sin, Unending Cataclysm",
  manaCost: "{5}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Leviathan", "Avatar"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample"],
  text:
    "Flying, trample\n" +
    "As Sin enters, remove all counters from any number of artifacts, creatures, and enchantments. Sin enters with X +1/+1 counters on it, where X is twice the number of counters removed this way.\n" +
    "When Sin dies, put its counters on target creature you control, then shuffle this card into its owner's library.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { removeCounters: { filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } } },
        counters: { kind: "+1/+1", amount: "done-as-enters", eachDone: 2 },
      },
      text: "As Sin enters, remove all counters from any number of artifacts, creatures, and enchantments. Sin enters with X +1/+1 counters on it, where X is twice the number of counters removed this way.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-counters-of", of: "source", target: 0 },
          { kind: "shuffle-into-library", target: "trigger-object" },
        ],
      },
      resolve: null,
      text: "When Sin dies, put its counters on target creature you control, then shuffle this card into its owner's library.",
    },
  ],
});
