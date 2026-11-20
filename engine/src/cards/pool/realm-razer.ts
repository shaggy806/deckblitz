import { defineCard } from "../define.js";

// EDHREC rank 23515. Worldgorger Dragon's pair with every land, the return
// `enterTapped`. Leaving before the exile resolves: the return finds nothing
// and the lands stay exiled for good (its ruling — the link is to this
// object, rule 607.2a).

const ENTER_TEXT = "When this creature enters, exile all lands.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled cards to the battlefield tapped under their owners' control.";

export default defineCard({
  name: "Realm Razer",
  manaCost: "{3}{R}{G}{W}",
  colors: ["R", "G", "W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { type: "land" }, linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield", enterTapped: true },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
