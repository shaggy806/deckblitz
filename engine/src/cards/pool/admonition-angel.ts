import { defineCard } from "../define.js";

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may exile target nonland permanent other than this creature.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return all cards exiled with it to the battlefield under their owners' control.";

// Linked abilities (rule 607.2a): each exile is "with" this stint, and the
// leaves trigger returns every card it exiled, together. If the Angel leaves
// before a landfall trigger resolves, the return comes first and the later
// exile links to a stint that's gone — exiled for good (the ruling), as
// Worldgorger Dragon's.
export default defineCard({
  name: "Admonition Angel",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${LANDFALL_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [{ kind: "other", of: "nonland-permanent" }],
      effect: {
        kind: "may",
        prompt: "Exile the target nonland permanent?",
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
