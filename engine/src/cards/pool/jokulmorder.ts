import { defineCard } from "../define.js";

// EDHREC rank 24385. Coldsnap.
//
// "Whenever you play an Island" is a land play only (`plays-card` filtered to
// an Island: no spell is an Island), so an Island put onto the battlefield by
// an effect doesn't untap it.

export default defineCard({
  name: "Jokulmorder",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 12,
  toughness: 12,
  keywords: ["trample"],
  text: "Trample\nThis creature enters tapped.\nWhen this creature enters, sacrifice it unless you sacrifice five lands.\nThis creature doesn't untap during your untap step.\nWhenever you play an Island, you may untap this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land" }, count: 5, text: "Sacrifice five lands" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "When this creature enters, sacrifice it unless you sacrifice five lands.",
    },
    {
      trigger: { on: "plays-card", who: "you", filter: { type: "land", subtype: "Island" } },
      targets: [],
      effect: { kind: "may", prompt: "Untap Jokulmorder?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: "Whenever you play an Island, you may untap this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
});
