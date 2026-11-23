import { defineCard } from "../define.js";

// Playtest card. One ability with two trigger events, written as two
// triggered abilities with one effect each. "+7/+7 for every seven" is the
// day-counter count divided by seven, rounded down (`step`).

const COUNTER_TEXT =
  "At the beginning of your combat step and whenever another Knight enters the battlefield under your control, put a day counter on The Knight of Weeks.";
const PT_TEXT = "The Knight of Weeks gets +7/+7 for every seven day counters on it.";
const DAY_COUNTER = { kind: "add-counter", target: "source", counter: "day", amount: 1 } as const;

export default defineCard({
  name: "The Knight of Weeks",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink", "vigilance", "first-strike"],
  text: `Lifelink, vigilance, first strike\n${COUNTER_TEXT}\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { countersOnSource: "day", step: 7, pt: [7, 7] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: DAY_COUNTER,
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Knight" }, otherOnly: true },
      targets: [],
      effect: DAY_COUNTER,
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
