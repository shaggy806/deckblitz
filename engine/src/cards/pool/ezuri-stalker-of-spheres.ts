import { defineCard } from "../define.js";

const ENTERS_TEXT = "When Ezuri enters, you may pay {3}. If you do, proliferate twice.";
const PROLIFERATE_TEXT = "Whenever you proliferate, draw a card.";

// The generic `proliferates` trigger (B278): even choosing nothing (its
// ruling), so proliferating twice draws two.
export default defineCard({
  name: "Ezuri, Stalker of Spheres",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${PROLIFERATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3} to proliferate twice?",
        cost: "{3}",
        effect: { kind: "sequence", effects: [{ kind: "proliferate" }, { kind: "proliferate" }] },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "event", event: "proliferates", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
  ],
});
