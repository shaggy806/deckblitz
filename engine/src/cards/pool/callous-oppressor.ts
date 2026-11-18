import { defineCard } from "../define.js";

// EDHREC rank 15995.
//
// The creature type is an opponent's choice as it enters (rule 614.12 —
// `chooseOnEnterBy`), which opponent its controller's pick among two or more,
// and kept as its chosen type. The control lasts only while it stays tapped
// (no "as long as you control" — `whileSourceTapped` alone): it ends as it
// untaps or leaves. A changeling is of the chosen type, so can't be targeted.

const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";
const CHOOSE_TEXT = "As this creature enters, an opponent chooses a creature type.";
const CONTROL_TEXT =
  "{T}: Gain control of target creature that isn't of the chosen type for as long as this creature remains tapped.";

export default defineCard({
  name: "Callous Oppressor",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 1,
  toughness: 2,
  text: `${UNTAP_TEXT}\n${CHOOSE_TEXT}\n${CONTROL_TEXT}`,
  chooseCreatureTypeOnEnter: true,
  chooseOnEnterBy: "an-opponent",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", not: { ofChosenType: true } } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSourceTapped: true },
      resolve: null,
      text: CONTROL_TEXT,
    },
  ],
});
