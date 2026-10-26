import { defineCard } from "../define.js";

const GREATEST = { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Miming Slime",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create an X/X green Ooze creature token, where X is the greatest power among creatures you control.",
  effect: {
    kind: "create-token",
    token: "Ooze Token (Convert to Slime)",
    count: 1,
    basePt: { power: GREATEST, toughness: GREATEST },
  },
});
