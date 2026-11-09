import { defineCard } from "../define.js";

// The spell's change has no duration: a permanent spell made colorless enters
// colorless and stays so until it leaves (the ruling; rule 400.7a).
export default defineCard({
  name: "Ersatz Gnomes",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 1,
  toughness: 1,
  text: "{T}: Target spell becomes colorless.\n{T}: Target permanent becomes colorless until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["spell"],
      effect: { kind: "become", target: 0, setColors: [], duration: "permanent" },
      resolve: null,
      text: "{T}: Target spell becomes colorless.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["permanent"],
      effect: { kind: "become", target: 0, setColors: [], duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target permanent becomes colorless until end of turn.",
    },
  ],
});
