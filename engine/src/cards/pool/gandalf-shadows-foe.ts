import { defineCard } from "../define.js";

// EDHREC rank 13142.

export default defineCard({
  name: "Gandalf, Shadow's Foe",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen Gandalf enters, exile up to three target lands you control, then return them to the battlefield tapped under their owner's control.\nLandfall — Whenever a land you control enters, draw a card and put a +1/+1 counter on Gandalf.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: { type: "land" } }, max: 3 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "flicker", target: 0, tapped: true },
      },
      resolve: null,
      text: "When Gandalf enters, exile up to three target lands you control, then return them to the battlefield tapped under their owner's control.",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, draw a card and put a +1/+1 counter on Gandalf.",
    },
  ],
});
