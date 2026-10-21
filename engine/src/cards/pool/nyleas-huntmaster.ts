import { defineCard } from "../define.js";

// X is read once, as the trigger resolves (the ruling).
const ENTER_TEXT =
  "When this creature enters, target creature you control gets +X/+0 until end of turn, where X is your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)";

export default defineCard({
  name: "Nylea's Huntmaster",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Shaman"],
  power: 4,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: { devotionTo: "G" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
