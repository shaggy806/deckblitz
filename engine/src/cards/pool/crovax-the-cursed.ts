import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 27003.
//
// Rulings:
//   [2004-10-04] You can only sacrifice one creature to it each turn.
//   [2004-10-04] Crovax can sacrifice itself to its upkeep triggered ability.
//   [2004-10-04] If you choose not to sacrifice a creature and he has no +1/+1 counters, then
//     nothing bad happens.
//
// Ravenous Vampire's shape: any creature its controller controls, Crovax
// included; with none to remove, the removal does nothing.

const ENTERS_TEXT = "Crovax enters with four +1/+1 counters on it.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may sacrifice a creature. If you do, put a +1/+1 counter on Crovax. If you don't, remove a +1/+1 counter from Crovax.";
const FLY_TEXT = "{B}: Crovax gains flying until end of turn.";

export default defineCard({
  name: "Crovax the Cursed",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${UPKEEP_TEXT}\n${FLY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: FLY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ifDidnt: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
