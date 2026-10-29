import { defineCard } from "../define.js";

const FACES = ["Cease // Desist", "Cease", "Desist"];
const DESIST_TEXT = "Destroy all artifacts and enchantments.";

export default defineCard({
  name: "Desist",
  manaCost: "{4}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: DESIST_TEXT,
  effect: { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"] } },
  faces: FACES,
  split: true,
});
