import { defineCard } from "../define.js";

// EDHREC rank 10055. "Discarded or put there from a library this turn": a
// card discarded this turn (`discardedThisTurn`) or one moved from a library
// to a graveyard (`putIntoGraveyardFromLibraryThisTurn`), still the same
// object (rule 400.7) — not one from a previous turn (the ruling).

const EVASION_TEXT = "Ghost of Ramirez DePietro can't be blocked by creatures with toughness 3 or greater.";
const TRIGGER_TEXT =
  "Whenever Ghost of Ramirez DePietro deals combat damage to a player, choose up to one target card in a graveyard that was discarded or put there from a library this turn. Put that card into its owner's hand.";

export default defineCard({
  name: "Ghost of Ramirez DePietro",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Pirate"],
  power: 2,
  toughness: 3,
  pairing: { kind: "partner" },
  text: `${EVASION_TEXT}\n${TRIGGER_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { toughness: { op: "gte", n: 3 } } }],
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "any",
            filter: { anyOf: [{ discardedThisTurn: true }, { putIntoGraveyardFromLibraryThisTurn: true }] },
          },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
