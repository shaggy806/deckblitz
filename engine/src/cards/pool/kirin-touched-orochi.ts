import { defineCard } from "../define.js";

// Back face of Teachings of the Kirin.
//
// A modal triggered ability announces its mode, and the mode's target, as it
// goes on the stack (Titanium Man's shape). "When you do" is a reflexive
// trigger (rule 603.12); the exile of its one target has certainly happened
// when the mode resolves at all (an illegal target stops the whole ability —
// rule 608.2b), so it follows the exile directly.
const MODE_1 = "Exile target creature card from a graveyard. When you do, create a 1/1 colorless Spirit creature token.";
const MODE_2 =
  "Exile target noncreature card from a graveyard. When you do, put a +1/+1 counter on target creature you control.";
const ATTACK_TEXT = `Whenever this creature attacks, choose one —\n• ${MODE_1}\n• ${MODE_2}`;

export default defineCard({
  name: "Kirin-Touched Orochi",
  art: "https://cards.scryfall.io/art_crop/back/4/c/4c0c6c2a-4352-4c65-b41d-2a722bbef6c5.jpg",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Snake", "Monk"],
  power: 1,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: MODE_1,
            targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: 0 },
                {
                  kind: "reflexive-trigger",
                  targets: [],
                  effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
                  text: "When you do, create a 1/1 colorless Spirit creature token.",
                },
              ],
            },
          },
          {
            text: MODE_2,
            targets: [{ kind: "card-in-graveyard", whose: "any", filter: { notTypes: ["creature"] } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: 0 },
                {
                  kind: "reflexive-trigger",
                  targets: ["creature-you-control"],
                  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                  text: "When you do, put a +1/+1 counter on target creature you control.",
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Teachings of the Kirin", "Kirin-Touched Orochi"],
  transform: true,
});
