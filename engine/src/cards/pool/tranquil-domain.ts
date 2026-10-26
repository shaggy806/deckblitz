import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 27386.

export default defineCard({
  name: "Tranquil Domain",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy all non-Aura enchantments.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment", notSubtypes: ["Aura"] } },
});
