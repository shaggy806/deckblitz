import { defineCard } from "../define.js";

const TEXT =
  "Black creatures can't attack unless their controller sacrifices a land of their choice for each black creature they control that's attacking. (This cost is paid as attackers are declared.)";

// On every attack by a black creature, whoever controls it (rule 508.1h): one
// land a creature, the whole declaration's asked as one choice.
export default defineCard({
  name: "Reclamation",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"] } },
      combatTax: { on: ["attack"], permanents: { do: "sacrifice", filter: { type: "land" }, noun: "land" } },
      text: TEXT,
    },
  ],
});
