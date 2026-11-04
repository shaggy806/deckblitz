import { defineCard } from "../define.js";

// Chapter I's tokens are their own objects (`separate`): "the tokens" are these,
// not a stack of older Warriors they might fold into. The goader is you, so your
// own tokens are goaded too and must attack if able (rule 701.15b).
const I_TEXT =
  "I — Each player creates three tapped 1/1 white Warrior creature tokens. The tokens are goaded for as long as this Saga remains on the battlefield.";
const II_TEXT = "II, III — Put a +1/+1 counter on each Warrior creature.";
const IV_TEXT = "IV — You may exile a nontoken creature you control. When you do, exile all Warriors.";

export default defineCard({
  name: "The War Games",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I_TEXT}\n${II_TEXT}\n${IV_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Warrior Token", count: 3, who: "each-player", tapped: true, separate: true },
          { kind: "goad", filter: { thisWay: "created" }, duration: "while-source" },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3],
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", subtype: "Warrior" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you", token: false },
            upTo: 1,
            then: { kind: "exile", target: 0 },
            prompt: "You may exile a nontoken creature you control. When you do, exile all Warriors.",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "reflexive-trigger",
              targets: [],
              effect: { kind: "exile-all", filter: { subtype: "Warrior" } },
              text: "Exile all Warriors.",
            },
          },
        ],
      },
      resolve: null,
      text: IV_TEXT,
    },
  ],
});
