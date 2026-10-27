import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 25029. Faceless Butcher's two-trigger exile
// (rule 607.2a), its target narrowed to creatures with shadow.
//
// Rulings:
//   [2021-03-19] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2021-03-19] If Faceless Devourer leaves the battlefield before its first triggered ability
//     has resolved, its last ability triggers. This ability does nothing when it resolves. Then
//     its first ability resolves and exiles the target creature indefinitely.

const ENTER_TEXT = "When this creature enters, exile another target creature with shadow.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Faceless Devourer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", keyword: "shadow" } } }],
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
