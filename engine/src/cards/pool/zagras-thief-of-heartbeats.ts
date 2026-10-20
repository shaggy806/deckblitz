import { defineCard } from "../define.js";

// EDHREC rank 10276.
//
// The cost reduction counts the party as it's cast (rule 700.8 — Deadly
// Alliance's shape). "Destroy that planeswalker" is the damage trigger's
// recipient, untargeted, and only while it's the same permanent (rule 400.7).

const PARTY_TEXT = "This spell costs {1} less to cast for each creature in your party.";
const DEATHTOUCH_TEXT = "Other creatures you control have deathtouch.";
const PLANESWALKER_TEXT =
  "Whenever a creature you control deals combat damage to a planeswalker, destroy that planeswalker.";

export default defineCard({
  name: "Zagras, Thief of Heartbeats",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "deathtouch", "haste"],
  text: `${PARTY_TEXT}\nFlying, deathtouch, haste\n${DEATHTOUCH_TEXT}\n${PLANESWALKER_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { type: "creature" }, to: "planeswalker", combat: true },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: PLANESWALKER_TEXT,
    },
  ],
});
