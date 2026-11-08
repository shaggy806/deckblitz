import { defineCard } from "../define.js";

const DOUBLE =
  "Delirium — If a source you control would deal noncombat damage to a permanent or player while there are four or more card types among cards in your graveyard, it deals double that damage instead.";
const ENTERS = "When The Rollercrusher Ride enters, it deals X damage to each of up to X target creatures.";

// Damage divided before doubling is doubled after (rule 616.1: the damaged
// player orders the doubling against prevention — the rulings).
export default defineCard({
  name: "The Rollercrusher Ride",
  manaCost: "{X}{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${DOUBLE}\n${ENTERS}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      replacement: { event: "would-deal-damage", instead: { modify: { times: 2 } }, combat: false, source: { controlledBy: "you" } },
      text: DOUBLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: "x" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "damage", amount: "x", target: 0 }, simultaneous: true },
      resolve: null,
      text: ENTERS,
    },
  ],
});
