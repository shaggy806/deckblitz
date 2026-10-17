import { defineCard } from "../define.js";

// "Doctor cards" and "Doctors" are the Doctor creature type, not "Doctor" in a
// name. The win is checked as the upkeep trigger resolves, after the optional
// put — whether or not a card was put — counting every Doctor you control.

const ENTERS_TEXT = "When Gallifrey Stands enters, return all Doctor cards from your graveyard to your hand.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may put a Doctor creature card from your hand onto the battlefield. Then if you control thirteen or more Doctors, you win the game.";

export default defineCard({
  name: "Gallifrey Stands",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-from-graveyard", filter: { subtype: "Doctor" }, destination: "hand", count: "all" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature", subtype: "Doctor" },
          },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Doctor" }, atLeast: 13 },
            then: { kind: "win-game" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
