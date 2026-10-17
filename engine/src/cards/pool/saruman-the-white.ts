import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// Ruling: spells cast before Saruman count toward "your second spell".
const AMASS_TEXT =
  "Whenever you cast your second spell each turn, amass Orcs 2. (Put two +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)";

export default defineCard({
  name: "Saruman the White",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 4,
  toughness: 4,
  text: `Ward {2}\n${AMASS_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Orc" },
      resolve: null,
      text: AMASS_TEXT,
    },
  ],
});
