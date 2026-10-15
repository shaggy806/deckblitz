import { defineCard } from "../define.js";

// EDHREC rank 23212.

const ENTER_TEXT = "When this creature enters, destroy up to one target noncreature artifact.";

export default defineCard({
  name: "Rock Soldiers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Elemental", "Soldier"],
  power: 4,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
