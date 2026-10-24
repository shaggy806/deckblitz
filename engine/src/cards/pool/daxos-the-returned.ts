import { defineCard } from "../define.js";

const XP_TEXT = "Whenever you cast an enchantment spell, you get an experience counter.";
const TOKEN_TEXT =
  "{1}{W}{B}: Create a white and black Spirit enchantment creature token. It has \"This creature's power and toughness are each equal to the number of experience counters you have.\"";

export default defineCard({
  name: "Daxos the Returned",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${XP_TEXT}\n${TOKEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}{B}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Experience Counters)", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "add-player-counters", counter: "experience", amount: 1 },
      resolve: null,
      text: XP_TEXT,
    },
  ],
});
