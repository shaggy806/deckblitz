import { defineCard } from "../define.js";

const VIGILANCE_TEXT = "Aang has vigilance as long as there's a Lesson card in your graveyard.";
const DIES_TEXT = "Whenever another creature you control dies, put a +1/+1 counter on Aang.";

export default defineCard({
  name: "Aang, A Lot to Learn",
  manaCost: "{2}{G/W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Ally"],
  power: 3,
  toughness: 2,
  text: `${VIGILANCE_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Lesson" } },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
