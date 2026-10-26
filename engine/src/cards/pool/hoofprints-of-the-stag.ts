import { defineCard } from "../define.js";

const DRAW_TEXT = "Whenever you draw a card, you may put a hoofprint counter on this enchantment.";
const TOKEN_TEXT =
  "{2}{W}, Remove four hoofprint counters from this enchantment: Create a 4/4 white Elemental creature token with flying. Activate only during your turn.";

// Each card drawn is its own trigger (the ruling).
export default defineCard({
  name: "Hoofprints of the Stag",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["kindred", "enchantment"],
  subtypes: ["Elemental"],
  text: `${DRAW_TEXT}\n${TOKEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, removeCounter: { kind: "hoofprint", count: 4 } },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Token (4/4 White Flying)", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
      condition: { kind: "your-turn" },
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a hoofprint counter on Hoofprints of the Stag?",
        effect: { kind: "add-counter", target: "source", counter: "hoofprint", amount: 1 },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
