import { defineCard } from "../define.js";

// EDHREC rank 3512. More Than Meets the Eye (rule 702.162a) is an alternative
// cost that casts the card converted, its back face (Slicer, High-Speed
// Antagonist) up on the stack (712.11a), so it enters converted. Convert is
// transform (701.28a). "That player" is the active player (each opponent's
// upkeep); the goad is Slicer's controller's, so the goaded Slicer must attack
// someone other than them (701.15b).
//
// Rulings:
//   [2022-10-14] The mana value of a spell cast using More Than Meets the Eye is determined by
//     the mana cost on the front face of the card, no matter what the total cost to cast the spell was.
//   [2022-10-14] When you cast a spell using its More Than Meets the Eye ability, the card is put
//     onto the stack with its back face up.

const UPKEEP_TEXT =
  "At the beginning of each opponent's upkeep, you may have that player gain control of Slicer until end of turn. If you do, untap Slicer, goad it, and it can't be sacrificed this turn. If you don't, convert it.";

export default defineCard({
  name: "Slicer, Hired Muscle",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 4,
  keywords: ["double-strike", "haste"],
  text:
    "More Than Meets the Eye {2}{R} (You may cast this card converted for {2}{R}.)\n" +
    "Double strike, haste\n" +
    UPKEEP_TEXT,
  faces: ["Slicer, Hired Muscle", "Slicer, High-Speed Antagonist"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{R}" },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have that player gain control of Slicer until end of turn? (If you don't, convert it.)",
        effect: { kind: "gain-control", target: "source", who: "active-player", untilEndOfTurn: true },
        then: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "source" },
            { kind: "goad", target: "source" },
            { kind: "cant-be-sacrificed", target: "source", duration: "end-of-turn" },
          ],
        },
        else: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
