import { defineCard } from "../define.js";

// Two linked abilities (rule 607.2a): the exile is "with this" stint
// (`exile-all`'s `linked`), and the leaves trigger returns those cards
// together under their owners' control. If the Dragon leaves before its
// enters trigger resolves, the return comes first and finds nothing; the
// exile then links to a stint that's gone, so the cards stay exiled for good.
const ENTER_TEXT = "When this creature enters, exile all other permanents you control.";
const LEAVE_TEXT = "When this creature leaves the battlefield, return the exiled cards to the battlefield under their owners' control.";

export default defineCard({
  name: "Worldgorger Dragon",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Nightmare", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { controlledBy: "you" }, exceptSource: true, linked: true },
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
