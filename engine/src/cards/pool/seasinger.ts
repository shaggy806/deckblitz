import { defineCard } from "../define.js";

// EDHREC rank 21490.
// "Whose controller controls an Island" is checked as the target is chosen
// and again on resolution (608.2b); once control is gained, the effect lasts
// as long as you control Seasinger and it stays tapped, whatever Islands
// anyone controls by then.

const SAC_TEXT = "When you control no Islands, sacrifice this creature.";
const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";
const STEAL_TEXT =
  "{T}: Gain control of target creature whose controller controls an Island for as long as you control this creature and this creature remains tapped.";

export default defineCard({
  name: "Seasinger",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 0,
  toughness: 1,
  text: `${SAC_TEXT}\n${UNTAP_TEXT}\n${STEAL_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", controllerControls: { subtype: "Island" } } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true, whileSourceTapped: true },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
