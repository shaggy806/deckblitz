import { defineCard } from "../define.js";

// One ability with two trigger events ("whenever … and when …" — rule 603.2,
// `sameAbilityAs`), making Vernal Sovereign's Elemental token. "During your
// turn" is part of the trigger condition (rule 603.1), so `whileCondition`,
// not an intervening "if".
const TEXT =
  "Whenever an opponent casts a spell during your turn and when this creature dies, create a green and white Elemental creature token with \"This token's power and toughness are each equal to the number of creatures you control.\"";

export default defineCard({
  name: "Voice of Resurgence",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Token (Vernal Sovereign)", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Elemental Token (Vernal Sovereign)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
