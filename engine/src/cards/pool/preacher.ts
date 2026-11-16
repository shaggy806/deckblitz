import { defineCard } from "../define.js";

// EDHREC rank 22513.

const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";
const STEAL_TEXT =
  "{T}: For as long as this creature remains tapped, gain control of target creature of an opponent's choice they control.";

// The activator chooses an opponent, who chooses the target among their own
// creatures (its ruling; `opponentChoosesTargets`). "Remains tapped" is
// checked from activation: an untap before it resolves ends it before it
// starts, even if Preacher is tapped again (its ruling, rule 611.2b).
export default defineCard({
  name: "Preacher",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: `${UNTAP_TEXT}\n${STEAL_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } }],
      opponentChoosesTargets: [0],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSourceTapped: true },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
