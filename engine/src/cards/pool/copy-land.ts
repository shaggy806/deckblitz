import { defineCard } from "../define.js";

// Declining, it's an enchantment that does nothing (its ruling).
export default defineCard({
  name: "Copy Land",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "You may have this enchantment enter as a copy of any land on the battlefield, except it's an enchantment in addition to its other types.",
  copyOnEnter: { filter: { type: "land" }, except: { addTypes: ["enchantment"] } },
});
