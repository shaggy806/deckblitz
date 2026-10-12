import { defineCard } from "../define.js";

// EDHREC rank 9945. Castle Doom's Doombot token. "You control an artifact
// creature" counts Doctor Doom himself should he become one (`countsSelf`).
const ENTER_TEXT =
  "When Doctor Doom enters, create two 3/3 colorless Robot Villain artifact creature tokens named Doombot.";
const INDESTRUCTIBLE_TEXT = "As long as you control an artifact creature or a Plan, Doctor Doom has indestructible.";
const END_TEXT = "At the beginning of your end step, you draw a card and lose 1 life.";

export default defineCard({
  name: "Doctor Doom",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${INDESTRUCTIBLE_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Doombot", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { anyOf: [{ types: ["artifact", "creature"] }, { subtype: "Plan" }] },
        atLeast: 1,
        countsSelf: true,
      },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
});
