import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 15083.
//
// Rulings: whose graveyard doesn't matter, only that an opponent controlled
// the permanent as it last existed — a `dies` trigger reads it that way
// (rule 603.10a), and "that opponent" is `"trigger-controller"`, the
// last-known controller. If they don't pay, the card must come back; a token
// that has ceased to exist, or a card gone from the graveyard, returns nothing
// (`put-onto-battlefield` of the trigger object finds no card there).
const TEXT =
  "Whenever a permanent an opponent controls is put into a graveyard, put that card onto the battlefield under your control unless that opponent pays 3 life.";

export default defineCard({
  name: "Prince of Thralls",
  manaCost: "{4}{U}{B}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { controlledBy: "opponent" } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ payLife: 3, text: "Pay 3 life" }],
        otherwise: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
