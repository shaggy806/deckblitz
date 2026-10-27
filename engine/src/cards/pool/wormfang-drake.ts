import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// EDHREC rank 23851.
//
// Rulings:
//   [2022-12-08] You choose which creature you control to exile (if any) as the
//     enters-the-battlefield ability resolves. Once you make that choice, no player may take
//     actions until the chosen creature is exiled or Wormfang Drake is sacrificed and the ability
//     has finished resolving.
//   [2022-12-08] If Wormfang Drake leaves the battlefield before its enters-the-battlefield
//     ability resolves, the "leaves-the-battlefield" ability will trigger and resolve first. It
//     won't return anything. Then the enters-the-battlefield ability will resolve. If you exile a
//     creature you control, it will be exiled indefinitely. Wormfang Drake won't return it.
//   [2022-12-08] If you don't control any other creatures as the enters-the-battlefield ability
//     resolves, you must sacrifice Wormfang Drake.
//
// Champion's two linked abilities without the keyword (rule 702.72b's shape):
// the creature is chosen as the trigger resolves, not targeted, and linked to
// this Drake (rule 607.2a); the leaves trigger returns only what this stint
// exiled, so a card exiled after the Drake left stays exiled (the ruling).

const ENTER_TEXT = "When this creature enters, sacrifice it unless you exile a creature you control other than this creature.";
const LEAVE_TEXT = "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

const [enters, leaves] = champion({ type: "creature" }, "a creature");

export default defineCard({
  name: "Wormfang Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Drake"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    { ...enters, text: ENTER_TEXT },
    { ...leaves, text: LEAVE_TEXT },
  ],
});
