import { defineCard } from "../define.js";

// Rulings:
//   [2024-09-20] If a creature that dies leaves the graveyard before Meathook Massacre II's second
//     or third ability (as appropriate) resolves, that creature won't return to the battlefield
//     regardless of whether or not life was paid.
//   [2024-09-20] When a token creature dies, Meathook Massacre II's second or third ability (as
//     appropriate) will trigger. The appropriate player has the option to pay 3 life, but
//     regardless of their choice, the token won't return to the battlefield.

const YOURS_TEXT =
  "Whenever a creature you control dies, you may pay 3 life. If you do, return that card under your control with a finality counter on it.";
const THEIRS_TEXT =
  "Whenever a creature an opponent controls dies, they may pay 3 life. If they don't, return that card under your control with a finality counter on it.";

export default defineCard({
  name: "Meathook Massacre II",
  manaCost: "{X}{X}{B}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `When Meathook Massacre II enters, each player sacrifices X creatures of their choice.\n${YOURS_TEXT}\n${THEIRS_TEXT}`,
  triggered: [
    {
      // "x" on its own enters trigger is the X it was cast with (rule 107.3m).
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: "x" },
      resolve: null,
      text: "When Meathook Massacre II enters, each player sacrifices X creatures of their choice.",
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 3 life to return that card with a finality counter?",
        costLife: 3,
        effect: {
          kind: "put-onto-battlefield",
          target: "trigger-object",
          underYourControl: true,
          withCounters: { kind: "finality", amount: 1 },
        },
      },
      resolve: null,
      text: YOURS_TEXT,
    },
    {
      // The dead creature's controller decides (a punisher choice, not the
      // effect controller's `may`).
      trigger: { on: "dies", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ payLife: 3, text: "Pay 3 life" }],
        otherwise: {
          kind: "put-onto-battlefield",
          target: "trigger-object",
          underYourControl: true,
          withCounters: { kind: "finality", amount: 1 },
        },
      },
      resolve: null,
      text: THEIRS_TEXT,
    },
  ],
});
