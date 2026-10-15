import { defineCard } from "../define.js";

// EDHREC rank 12492.
// Rulings:
//   [2025-06-06] Sidequest: Hunt the Mark's last ability checks at the moment it would trigger to
//     see if a creature died under an opponent's control this turn. If none did, the ability won't
//     trigger at all. Once your end step begins, it's too late to cause creatures your opponents
//     control to die in order to cause this ability to trigger.

const ENTER_TEXT = "When this enchantment enters, destroy up to one target creature.";
const END_TEXT =
  "At the beginning of your end step, if a creature died under an opponent's control this turn, create a Treasure token. Then if you control three or more Treasures, transform this enchantment.";

export default defineCard({
  name: "Sidequest: Hunt the Mark",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // An intervening-if (rule 603.4) over the turn's deaths under any
      // opponent's control; the Treasure count is read after the new one is
      // made (Sidequest: Raise a Chocobo's transform).
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "died", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Treasure" }, atLeast: 3 },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Sidequest: Hunt the Mark", "Yiazmat, Ultimate Mark"],
  transform: true,
});
