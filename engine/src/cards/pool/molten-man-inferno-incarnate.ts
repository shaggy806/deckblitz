import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When Molten Man enters, search your library for a basic Mountain card, put it onto the battlefield tapped, then shuffle.";
const PT_TEXT = "Molten Man gets +1/+1 for each Mountain you control.";
const LEAVE_TEXT = "When Molten Man leaves the battlefield, sacrifice a land.";

export default defineCard({
  name: "Molten Man, Inferno Incarnate",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Villain"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${PT_TEXT}\n${LEAVE_TEXT}`,
  static: [
    {
      // Branch of Boseiju's count, Mountains only (any Mountain, not just basics).
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Mountain", controlledBy: "you" }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land", subtype: "Mountain" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // However it leaves — dying as a 0/0 included — and with its enters
      // trigger still waiting, this one resolves first (the ruling).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
