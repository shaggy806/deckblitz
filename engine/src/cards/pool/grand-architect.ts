import { defineCard } from "../define.js";

// EDHREC rank 7304. The mana ability taps any untapped blue creature you
// control, Grand Architect itself and a summoning-sick one included (the
// rulings; rule 302.6 covers only {T}). Its `tapOthers` cost keeps it out of
// the auto-payer (AUTHORING §15): it's activated by hand, floating the mana.
const ANTHEM = "Other blue creatures you control get +1/+1.";
const BLUE = "{U}: Target artifact creature becomes blue until end of turn.";
const MANA =
  "Tap an untapped blue creature you control: Add {C}{C}. Spend this mana only to cast artifact spells or activate abilities of artifacts.";

export default defineCard({
  name: "Grand Architect",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Artificer"],
  power: 1,
  toughness: 3,
  text: `${ANTHEM}\n${BLUE}\n${MANA}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", colors: ["U"], controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "become-color", target: 0, colors: ["U"], duration: "end-of-turn" },
      resolve: null,
      text: BLUE,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", colors: ["U"], controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: { type: "artifact" },
          text: "Spend this mana only to cast artifact spells or activate abilities of artifacts.",
        },
      },
      resolve: null,
      text: MANA,
    },
  ],
});
