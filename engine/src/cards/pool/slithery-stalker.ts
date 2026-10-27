import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, exile target green or white creature an opponent controls.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Slithery Stalker",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 1,
  toughness: 1,
  keywords: ["swampwalk"],
  text: `Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        },
      ],
      effect: { kind: "exile", target: 0, linked: true },
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
