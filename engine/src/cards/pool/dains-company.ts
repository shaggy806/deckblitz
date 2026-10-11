import { defineCard } from "../define.js";

// "Another Dwarf": a static's condition already leaves its own permanent
// out of the count (`ConditionOptions.includeSelf`).
const LIFELINK_TEXT = "This creature has lifelink as long as you control another Dwarf.";
const ETB_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a Dwarf or Equipment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Dáin's Company",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${LIFELINK_TEXT}\n${ETB_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dwarf" }, atLeast: 1 },
      grantKeywords: ["lifelink"],
      text: LIFELINK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ subtype: "Dwarf" }, { subtype: "Equipment" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
