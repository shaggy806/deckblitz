import { defineCard } from "../define.js";

// Aether Revolt. The first mode is Chance's "discard any number of cards, then
// draw that many", made by the target player — who picks how many and which.
// The second counts the instants and sorceries in your graveyard as it
// resolves (this spell is still on the stack, so not itself).
const DISCARD_TEXT = "Target player discards any number of cards, then draws that many cards.";
const DAMAGE_TEXT =
  "Steal the Show deals damage equal to the number of instant and sorcery cards in your graveyard to target creature or planeswalker.";

export default defineCard({
  name: "Steal the Show",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one or both —\n• ${DISCARD_TEXT}\n• ${DAMAGE_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: DISCARD_TEXT,
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: 0, amount: 0, anyNumber: true },
            { kind: "draw", target: 0, amount: { thisWay: "discarded" } },
          ],
        },
      },
      {
        text: DAMAGE_TEXT,
        targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        effect: {
          kind: "damage",
          amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
          target: 0,
        },
      },
    ],
  },
});
