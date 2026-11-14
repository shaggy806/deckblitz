import { defineCard } from "../define.js";

// "You've visited an Attraction this turn" reads the journal's `visited`
// entries (rule 701.52a), whether or not that Attraction is still around.

const INDESTRUCTIBLE =
  "As long as you've visited an Attraction this turn, this creature has indestructible. (Damage and effects that say \"destroy\" don't destroy it.)";
const OPEN = "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";

export default defineCard({
  name: "Soul Swindler",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Employee"],
  power: 5,
  toughness: 3,
  text: `${INDESTRUCTIBLE}\n${OPEN}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "visited" },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
  ],
});
