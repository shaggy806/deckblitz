import { defineCard } from "../define.js";

// "Those creatures" are the ones goaded: the set fixed as this resolves, so a
// creature that comes under an opponent's control later is neither goaded nor
// kept from blocking.
const FILTER = { type: "creature", controlledBy: "opponent" } as const;

export default defineCard({
  name: "Taunt from the Rampart",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  types: ["sorcery"],
  text: "Goad all creatures your opponents control. Until your next turn, those creatures can't block. (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "goad", filter: FILTER },
      { kind: "restrict", filter: FILTER, asItResolves: true, restrictions: ["cant-block"], duration: "until-your-next-turn" },
    ],
  },
});
