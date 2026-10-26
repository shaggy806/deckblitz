import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 12966.
//
// Rulings:
//   [2005-02-01] You must still pay the mana cost of the target instant in your graveyard to cast
//     it using Toshiro's ability.
//   [2011-01-01] Creatures destroyed by an instant that you cast normally can cause a trigger that
//     allows the instant to be cast again. For example, cast Terror on an opponent's creature. The
//     creature is destroyed, triggering Toshiro's ability, and then the Terror is put into your
//     graveyard. You can put Toshiro's ability on the stack targeting the Terror and then recast
//     it when the ability resolves.
//
// The cast is `cast-now` without `free` (Chandra, Flame's Catalyst's −2):
// paid for, and exiled rather than put into a graveyard (`exileAfter`).
const BUSHIDO_TEXT = "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)";
const CAST_TEXT =
  "Whenever a creature an opponent controls dies, you may cast target instant card from your graveyard. If that spell would be put into a graveyard, exile it instead.";

export default defineCard({
  name: "Toshiro Umezawa",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 2,
  text: `${BUSHIDO_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: BUSHIDO_TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: BUSHIDO_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "instant" } }],
      effect: { kind: "cast-now", target: 0, exileAfter: true },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
