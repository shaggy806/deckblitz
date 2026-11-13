import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 5105.
//
// Rulings:
//   Even 1 damage dealt to a creature from a source with deathtouch is considered lethal damage,
//     so any amount greater than that will cause excess damage to be dealt, even if the total
//     amount of damage isn't greater than the creature's toughness. Note that a source of damage
//     having deathtouch has no effect on damage dealt to planeswalkers.
//   A creature has been dealt excess damage if one or more sources dealt more damage to it than
//     the minimum amount of damage required to be lethal damage. In most cases, this means damage
//     greater than its toughness, but consider the damage already dealt to it that turn.
//   A planeswalker is dealt excess damage if it's dealt damage greater than its current loyalty.
//   If a permanent has more than one ward ability, the abilities trigger individually. The spell
//     or ability will be countered if either of the ward costs aren't paid.
//   Rith's ability will trigger as long as an opponent controlled the creature as excess damage
//     was dealt to it, even if the creature is no longer on the battlefield or you control it at
//     the end of the turn.
//   It doesn't matter whether a creature, spell, or ability you control deals the excess damage,
//     only that excess damage was dealt at some point during the turn.

const GRANT_TEXT = "Other Dragons you control have ward {2}.";
const END_STEP_TEXT =
  "At the beginning of your end step, if a creature or planeswalker an opponent controlled was dealt excess damage this turn, create a 4/4 red Dragon creature token with flying.";

export default defineCard({
  name: "Rith, Liberated Primeval",
  manaCost: "{2}{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying, ward {2}\n${GRANT_TEXT}\n${END_STEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Dragon", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [ward({ mana: "{2}" })],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // Whoever controlled it as it was dealt the damage, though it has died
      // or changed hands since (the ruling).
      condition: {
        kind: "turn-history",
        what: "excess-damaged",
        who: "opponent",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
      },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 1 },
      resolve: null,
      text: END_STEP_TEXT,
    },
  ],
});
