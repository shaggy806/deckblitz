import { defineCard } from "../define.js";

// "Whenever you create a Blood token": a token enters under the control of the
// player who creates it (rule 111.2). "If you control five or more Blood tokens"
// is an intervening-if, read as it triggers and as it resolves (its ruling).
const BLOOD =
  "Whenever this creature or another nontoken creature you control dies, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const TRANSFORM = "Whenever you create a Blood token, if you control five or more Blood tokens, transform this creature.";

export default defineCard({
  name: "Voldaren Bloodcaster",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${BLOOD}\n${TRANSFORM}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: BLOOD,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: BLOOD,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Blood", token: true } },
      condition: { kind: "controls", filter: { subtype: "Blood", token: true }, atLeast: 5 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM,
    },
  ],
  faces: ["Voldaren Bloodcaster", "Bloodbat Summoner"],
  transform: true,
});
