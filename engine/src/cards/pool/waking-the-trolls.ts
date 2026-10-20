import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 14881. III: the difference is never below 0
// (rule 107.1b), so an opponent with as many lands or more makes no Trolls.
const I_TEXT = "I — Destroy target land.";
const II_TEXT = "II — Put target land card from a graveyard onto the battlefield under your control.";
const III_TEXT =
  "III — Choose target opponent. If they control fewer lands than you, create a number of 4/4 green Troll Warrior creature tokens with trample equal to the difference.";

export default defineCard({
  name: "Waking the Trolls",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    { at: [1], targets: ["land"], effect: { kind: "destroy", target: 0 }, resolve: null, text: I_TEXT },
    {
      at: [2],
      targets: [{ kind: "card-in-graveyard", filter: { type: "land" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: ["opponent"],
      effect: {
        kind: "create-token",
        token: "Troll Warrior Token",
        count: {
          difference: [
            { countOf: { type: "land", controlledBy: "you" } },
            { countOf: { type: "land", controlledBy: "you" }, forTarget: 0 },
          ],
        },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
