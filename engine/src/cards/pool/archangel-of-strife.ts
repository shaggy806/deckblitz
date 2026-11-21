import { defineCard } from "../define.js";

// EDHREC rank 18556. Each player's choice is made as it enters (rule 614.12),
// the active player first and then the others in turn order (101.4 — its
// ruling), and kept on it per player (`chooseOnEnterBy: "each-player"`); the
// two anthems read the choice of each creature's controller
// (`controllerChoseOnEnter`), so they're linked to that ability (607.2).
//
// Rulings:
//   As soon as Archangel of Strife leaves the battlefield, the bonus stops applying. If it
//     returns to the battlefield, players will be able to make new choices.
//   Archangel of Strife's bonuses apply immediately. Depending on your choice, Archangel of
//     Strife will enter as either a 9/6 or 6/9 creature.
//   If there are two Archangels of Strife on the battlefield, and you choose war for one and
//     peace for the other, your creatures get +3/+3.

const CHOOSE_TEXT = "As this creature enters, each player chooses war or peace.";
const WAR_TEXT = "Creatures controlled by players who chose war get +3/+0.";
const PEACE_TEXT = "Creatures controlled by players who chose peace get +0/+3.";

export default defineCard({
  name: "Archangel of Strife",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${CHOOSE_TEXT}\n${WAR_TEXT}\n${PEACE_TEXT}`,
  chooseOnEnter: ["war", "peace"],
  chooseOnEnterBy: "each-player",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controllerChoseOnEnter: "war" } },
      grantPt: [3, 0],
      text: WAR_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controllerChoseOnEnter: "peace" } },
      grantPt: [0, 3],
      text: PEACE_TEXT,
    },
  ],
});
