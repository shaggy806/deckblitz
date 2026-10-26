import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). Bushido 2 (rule 702.45a) as two triggers, Jade
// Avenger's way. "Samurai creatures you control" are the ones there as the
// ability resolves (rule 611.2c).
const BUSHIDO = "Bushido 2";
const PUMP = { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" } as const;
const SAC_TEXT = "{2}{R}, Sacrifice a Samurai: Samurai creatures you control gain double strike until end of turn.";

export default defineCard({
  name: "Iizuka the Ruthless",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  text: `Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)\n${SAC_TEXT}`,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: BUSHIDO },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: { filter: { subtype: "Samurai" } } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", subtype: "Samurai", controlledBy: "you" },
        keyword: "double-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
