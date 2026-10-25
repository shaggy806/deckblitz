import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 19844. Snarespinner's shape.

const TEXT = "Whenever this creature blocks a creature with flying, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Netcaster Spider",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { keyword: "flying" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
