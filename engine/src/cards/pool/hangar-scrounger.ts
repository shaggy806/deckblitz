import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import { backup } from "../helpers.js";

// EDHREC rank 15607.
//
// Backup grants the rummage trigger printed below it, fixed as it triggers;
// on the Scrounger itself it's just the counter (the rulings).

const TAPPED_TEXT = "Whenever this creature becomes tapped, you may discard a card. If you do, draw a card.";

const TAPPED: TriggeredAbility = {
  trigger: { on: "becomes-tapped", who: "self" },
  targets: [],
  effect: {
    kind: "may",
    prompt: "Discard a card to draw a card?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard", target: "you", amount: 1 },
        { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
      ],
    },
  },
  resolve: null,
  text: TAPPED_TEXT,
};

export default defineCard({
  name: "Hangar Scrounger",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Pilot"],
  power: 2,
  toughness: 1,
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n${TAPPED_TEXT}`,
  triggered: [backup(1, { triggered: [TAPPED] }), TAPPED],
});
