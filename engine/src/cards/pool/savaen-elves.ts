import { defineCard } from "../define.js";

const TEXT = "{G}{G}, {T}: Destroy target Aura attached to a land.";

export default defineCard({
  name: "Savaen Elves",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Aura", attachedTo: { type: "land" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
