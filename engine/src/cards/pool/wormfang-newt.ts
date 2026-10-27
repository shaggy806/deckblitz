import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, exile a land you control.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

// Two triggers, not "until it leaves": the land is chosen (not targeted) as
// the first resolves and linked to this creature (rule 607.2a), and the
// second returns it — Journey to Nowhere's pair.
export default defineCard({
  name: "Wormfang Newt",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Salamander", "Beast"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "exile", target: 0, linked: true },
        prompt: "Exile a land you control",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
