import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 19385. Chapter III's "exile a Human you control and an artifact
// you control" is two different permanents, one a slot (`together.oneEach`):
// an Artifact Human fills one of them, not both, and the choice is offered
// only when both can be filled (rule 608.2d). "If you do" is having exiled
// them; the search is then for any card with the creature type Doctor.
//
// Rulings:
//   The last ability can find any card with the Doctor creature type, not just a card with "Doctor"
//     in the name.

const I_TEXT = "I — Create a 1/1 white Human creature token with ward {2} and a 4/4 white Alien Rhino creature token.";
const II_TEXT = "II — Investigate.";
const III_TEXT =
  "III — You may exile a Human you control and an artifact you control. If you do, search your library for a Doctor card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Fugitive of the Judoon",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Human Token (ward {2})", count: 1 },
          { kind: "create-token", token: "Alien Rhino Token", count: 1 },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    { at: [2], targets: [], effect: investigate(), resolve: null, text: II_TEXT },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        prompt: "Exile a Human you control and an artifact you control?",
        effect: {
          kind: "choose-permanents",
          filter: { controlledBy: "you", anyOf: [{ subtype: "Human" }, { type: "artifact" }] },
          min: 2,
          upTo: 2,
          together: {
            oneEach: [
              { label: "a Human you control", filter: { subtype: "Human" } },
              { label: "an artifact you control", filter: { type: "artifact" } },
            ],
          },
          // Both exiled at once, one instruction over the pair.
          thenTogether: true,
          then: { kind: "exile-all", filter: { thisWay: "chosen" } },
          prompt: "Exile a Human you control and an artifact you control",
        },
        ifDid: {
          kind: "search-library",
          filter: { subtype: "Doctor" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
