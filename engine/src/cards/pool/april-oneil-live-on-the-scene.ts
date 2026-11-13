import { defineCard } from "../define.js";

// EDHREC rank 10567. Investigate is creating a Clue token (rule 701.16a).

const ENTER_TEXT =
  'Whenever a Mutant, Ninja, or Turtle you control enters, investigate. (Create a Clue token. It\'s an artifact with "{2}, Sacrifice this token: Draw a card.")';

export default defineCard({
  name: "April O'Neil, Live on the Scene",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 1,
  pairing: { kind: "partner-group", group: "Character select" },
  text: `${ENTER_TEXT}\nPartner—Character select`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtypes: ["Mutant", "Ninja", "Turtle"] } },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
