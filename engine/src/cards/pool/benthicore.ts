import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 27752. The tap cost may tap Benthicore itself
// when it's a Merfolk (a changeling effect) — Kumena's shape.
const ETB_TEXT = "When this creature enters, create two 1/1 blue Merfolk Wizard creature tokens.";
const UNTAP_TEXT =
  "Tap two untapped Merfolk you control: Untap this creature. It gains shroud until end of turn. (It can't be the target of spells or abilities.)";

export default defineCard({
  name: "Benthicore",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  text: `${ETB_TEXT}\n${UNTAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Wizard Token", count: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { subtype: "Merfolk", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
