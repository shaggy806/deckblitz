import { defineCard } from "../define.js";

// Ravnica Allegiance (RNA). EDHREC rank 11239.
//
// Two `be-targeted` prohibitions by opponents, one over lands on the
// battlefield (every player's) and one over land cards in graveyards — a
// land card elsewhere (exile) isn't protected — and a `play-land` one, from
// graveyards, for opponents: a permission to play a land from a graveyard
// (Crucible of Worlds) doesn't override it (rule 101.2; the ruling).
//
// Rulings:
//   - Tomik's middle ability is similar to hexproof, but effects that interact with hexproof
//     don't count these lands or land cards as having hexproof.
//   - Players can't normally play a land card from a graveyard. If a player finds a way to do so,
//     Tomik's last ability takes precedence over that permission.

const UNTARGETABLE =
  "Lands on the battlefield and land cards in graveyards can't be the targets of spells or abilities your opponents control.";
const NO_PLAY = "Your opponents can't play land cards from graveyards.";

export default defineCard({
  name: "Tomik, Distinguished Advokist",
  manaCost: "{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${UNTARGETABLE}\n${NO_PLAY}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "be-targeted", by: "opponents", object: { type: "land", inZone: "battlefield" } },
        { act: "be-targeted", by: "opponents", object: { type: "land", inZone: "graveyard" } },
      ],
      text: UNTARGETABLE,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "play-land", who: "opponents", from: ["graveyard"] }],
      text: NO_PLAY,
    },
  ],
});
