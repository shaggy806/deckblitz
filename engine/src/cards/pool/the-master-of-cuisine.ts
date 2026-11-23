import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). A modal trigger's mode, and its target,
// are chosen as it's put on the stack (rule 700.2b).

const SAC_TEXT = "Whenever you sacrifice a food, choose one —";
const GELATO = "Gelato — Target creature gains haste and trample until end of turn.";
const PASTA = "Pasta — Scry 1.";
const PIZZA = "Pizza — Tap target creature.";

export default defineCard({
  name: "The Master of Cuisine",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Chef"],
  power: 3,
  toughness: 3,
  text: `Whenever this creature attacks, create a Food token.\n${SAC_TEXT}\n• ${GELATO}\n• ${PASTA}\n• ${PIZZA}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "Whenever this creature attacks, create a Food token.",
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Food" } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: GELATO,
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
              ],
            },
          },
          { text: PASTA, effect: { kind: "scry", amount: 1 } },
          { text: PIZZA, targets: ["creature"], effect: { kind: "tap", target: 0 } },
        ],
      },
      resolve: null,
      text: `${SAC_TEXT} ${GELATO} ${PASTA} ${PIZZA}`,
    },
  ],
});
