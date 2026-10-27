import { defineCard } from "../define.js";

// EDHREC rank 4823. The count reads each creature as it entered (its ruling:
// even one no longer on the battlefield, a creature, or yours), Gyome itself
// included on the turn it entered.

export default defineCard({
  name: "Gyome, Master Chef",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll", "Warlock"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nAt the beginning of your end step, create a number of Food tokens equal to the number of nontoken creatures you had enter the battlefield under your control this turn.\n{1}, Sacrifice a Food: Target creature gains indestructible until end of turn. Tap it.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { subtype: "Food" } } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: 0 },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice a Food: Target creature gains indestructible until end of turn. Tap it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Food Token",
        count: { turnHistory: "entered", filter: { type: "creature", token: false } },
      },
      resolve: null,
      text: "At the beginning of your end step, create a number of Food tokens equal to the number of nontoken creatures you had enter the battlefield under your control this turn.",
    },
  ],
});
