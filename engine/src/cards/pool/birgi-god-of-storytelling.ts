import { defineCard } from "../define.js";

// A modal DFC; the back face is Harnfel, Horn of Bounty. The trigger uses the
// stack and isn't a mana ability (the ruling), and `persists` is "you don't
// lose this mana as steps and phases end".

const MANA_TEXT = "Whenever you cast a spell, add {R}. Until end of turn, you don't lose this mana as steps and phases end.";
const BOAST_TEXT = "Creatures you control can boast twice during each of your turns rather than once.";

export default defineCard({
  name: "Birgi, God of Storytelling",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 3,
  toughness: 3,
  text: `${MANA_TEXT}\n${BOAST_TEXT}`,
  faces: ["Birgi, God of Storytelling", "Harnfel, Horn of Bounty"],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1, persists: true },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      boastsEachOfYourTurns: 2,
      text: BOAST_TEXT,
    },
  ],
});
