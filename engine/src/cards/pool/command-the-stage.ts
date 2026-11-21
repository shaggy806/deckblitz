import { defineCard } from "../define.js";

// EDHREC rank 18943.
//
// "Each other Wizard token": every Wizard token you control but the Cadet
// just made (`notThisWay: "created"`, Martial Coup's "other"). The upkeep
// ability works from the graveyard (`fromGraveyard`), on every player's
// upkeep, with the journal's `noncombat-damaged` over the turn before for its
// intervening if (rule 603.4) — asked as it triggers and as it resolves.

const SPELL_TEXT =
  "Create a 2/2 colorless Wizard Soldier creature token named Cadet, then put a +1/+1 counter on each other Wizard token you control.";
const UPKEEP_TEXT =
  "At the beginning of each upkeep, if an opponent was dealt noncombat damage last turn, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Command the Stage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${SPELL_TEXT}\n${UPKEEP_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Cadet", count: 1 },
      {
        kind: "add-counter-all",
        filter: { subtype: "Wizard", token: true, controlledBy: "you", notThisWay: "created" },
        counter: "+1/+1",
        amount: 1,
      },
    ],
  },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "turn-history", what: "noncombat-damaged", who: "opponent", window: "last-turn" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
