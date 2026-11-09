import { defineCard } from "../define.js";

// Devour is an "as this enters" ability, so the token asks as it is created
// and may devour Dragon Broodmother itself (the ruling).
const UPKEEP_TEXT =
  "At the beginning of each upkeep, create a 1/1 red and green Dragon creature token with flying and devour 2. (As the token enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)";

export default defineCard({
  name: "Dragon Broodmother",
  manaCost: "{2}{R}{R}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Flying, Devour 2)", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
