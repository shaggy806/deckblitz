import { defineCard } from "../define.js";

// One ability with two trigger events, written as two entries counted as one
// (`sameAbilityAs`). Cast face down with disguise it enters with no abilities,
// so the enters half doesn't fire then; turning it face up fires the other.

const TEXT =
  "When this creature enters or is turned face up, create a 1/1 colorless Thopter artifact creature token with flying.";

export default defineCard({
  name: "Gadget Technician",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 3,
  toughness: 2,
  text: `${TEXT}\nDisguise {U/R}{U/R} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  morph: { keyword: "disguise", cost: "{U/R}{U/R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
