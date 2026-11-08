import { defineCard } from "../define.js";

// EDHREC rank 13762.

const COMBAT =
  "At the beginning of each combat, if you have at least 10 life more than your starting life total, creatures you control get +2/+2 and gain vigilance until end of turn.";

export default defineCard({
  name: "Doctor Strange, Surgeon",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor", "Hero"],
  power: 2,
  toughness: 5,
  keywords: ["lifelink"],
  text: `Lifelink\nIf you would gain life, you gain twice that much life instead.\n${COMBAT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", instead: { modify: { times: 2 } } },
      text: "If you would gain life, you gain twice that much life instead.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      condition: { kind: "life-total", atLeast: { startingPlus: 10 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
