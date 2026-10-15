import { defineCard } from "../define.js";

// EDHREC rank 22119.
//
// The type change is layer 4, so a Villain she makes a Hero is a legal
// target for her connive ability (and for anything else that names Heroes).
const TYPE_TEXT = "Other Villains you control are Heroes in addition to their other types.";
const CONNIVE_TEXT =
  "{T}: Target Hero you control connives. Activate only as a sorcery. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

export default defineCard({
  name: "Valentina Allegra de Fontaine",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Villain"],
  power: 2,
  toughness: 3,
  text: `${TYPE_TEXT}\n${CONNIVE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Villain", controlledBy: "you" }, excludeSelf: true },
      addSubtypes: ["Hero"],
      text: TYPE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Hero" } }],
      effect: { kind: "connive", target: 0 },
      resolve: null,
      text: CONNIVE_TEXT,
      sorcerySpeed: true,
    },
  ],
});
