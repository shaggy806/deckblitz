import { defineCard } from "../define.js";

// EDHREC rank 4404. An Aura on a permanent you control, whoever controls the
// Aura; not your Auras on others' permanents (the rulings). Which Aura goes is
// the permanent's controller's choice (616.1).
export default defineCard({
  name: "Umbra Mystic",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Auras attached to permanents you control have umbra armor. (If an enchanted permanent you control would be destroyed, instead remove all damage from it and destroy an Aura attached to it.)",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Aura", attachedTo: { controlledBy: "you" } } },
      grantKeywords: ["umbra-armor"],
      text: "Auras attached to permanents you control have umbra armor.",
    },
  ],
});
