import { defineCard } from "../define.js";
// EDHREC rank 17615.
//
// Rulings:
//   Once Melira's replacement effect has been applied in a turn, additional events that would put
//     poison counters on a player don't happen, regardless of any other replacement effects
//     involved.
//   If another replacement effect would also change the number of poison counters a player
//     receives, such as that of Vorinclex, Monstrous Raider, the player receiving the counters
//     chooses which one to apply first. This will usually result in that player choosing to apply
//     Melira's effect last and receive one counter.
//
// The replacement sets the placement to one counter (`set`, ordered with the others the way best
// for the player, rule 616.1) and, beside it, a "can't get poison counters" prohibition for the
// rest of the turn. The exile ability's watch follows the target for the turn (Graceful Reprieve's
// shape), and the card comes back as a new object under its owner's control.
const REPLACEMENT_TEXT =
  "If you would get one or more poison counters, instead you get one poison counter and you can't get additional poison counters this turn.";
const EXILE_TEXT =
  "Exile Melira: Choose another target creature or artifact. When it's put into a graveyard this turn, return that card to the battlefield under its owner's control.";
export default defineCard({
  name: "Melira, the Living Cure",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 3,
  text: `${REPLACEMENT_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        onPlayers: "you",
        counterKind: "poison",
        instead: {
          modify: { set: 1 },
          also: {
            kind: "prohibit",
            prohibits: [{ act: "get-counters", who: "you", kind: "poison" }],
            duration: "end-of-turn",
          },
        },
      },
      text: REPLACEMENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "exile", target: "source" } },
      targets: [{ kind: "other", of: "artifact-or-creature" }],
      effect: {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "put-onto-battlefield", target: "trigger-object" },
        text: "When it's put into a graveyard this turn, return that card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
