import { defineCard } from "../define.js";

// EDHREC rank 31162.
//
// The pump locks in the creatures on the battlefield as it resolves (rule
// 611.2c) and ends once this artifact untaps or leaves (rule 611.2b).

const ECHO_TEXT =
  "Echo {4} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)";
const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";
const PUMP_TEXT = "{2}, {T}: All creatures get +2/+2 for as long as this artifact remains tapped.";

export default defineCard({
  name: "Thran Weaponry",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ECHO_TEXT}\n${UNTAP_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "modify-pt-all", filter: { type: "creature" }, power: 2, toughness: 2, duration: "while-source-tapped" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{4}", text: "Pay {4}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ECHO_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
});
