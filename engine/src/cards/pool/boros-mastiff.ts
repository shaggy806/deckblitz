import { defineCard } from "../define.js";

// EDHREC rank 21768. Makeshift Battalion's battalion trigger.

const TEXT =
  "Battalion — Whenever this creature and at least two other creatures attack, this creature gains lifelink until end of turn. (Damage dealt by a creature with lifelink also causes its controller to gain that much life.)";

export default defineCard({
  name: "Boros Mastiff",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
