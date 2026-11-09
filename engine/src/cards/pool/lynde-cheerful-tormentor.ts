import { defineCard } from "../define.js";

const RETURN_TEXT =
  "Whenever a Curse is put into your graveyard from the battlefield, return it to the battlefield attached to you at the beginning of the next end step.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may attach a Curse attached to you to one of your opponents. If you do, draw two cards.";

// EDHREC rank 12373. Nothing here targets, so a hexproof opponent can be
// given the Curse (its ruling).
export default defineCard({
  name: "Lynde, Cheerful Tormentor",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${RETURN_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "any", to: ["graveyard"], filter: { subtype: "Curse", ownedBy: "you" } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: { kind: "put-onto-battlefield", target: "trigger-object", attachedTo: { player: "you" } },
        text: "Return that Curse to the battlefield attached to you.",
      },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Curse", attachedToPlayer: "you" }, atLeast: 1, anyController: true },
        then: {
          kind: "may",
          prompt: "Attach a Curse attached to you to one of your opponents, and draw two cards?",
          effect: {
            kind: "choose-opponent",
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "attach",
                  attachment: { choose: { subtype: "Curse", attachedToPlayer: "you" }, prompt: "Choose a Curse attached to you", upTo: 1, min: 1 },
                  target: { player: "that-player" },
                },
                { kind: "conditional", condition: { kind: "this-way", what: "attached", atLeast: 1 }, then: { kind: "draw", amount: 2 } },
              ],
            },
          },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
