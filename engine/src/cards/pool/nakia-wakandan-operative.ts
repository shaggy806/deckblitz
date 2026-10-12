import { defineCard } from "../define.js";

// EDHREC rank 19307. Marvel Super Heroes Commander.
//
// "Your commander" is one you own, whoever controls it (Tome of Legends'
// reading) — Nakia herself, when she's your commander. "Target creature or
// Vehicle" is any player's (Roaring Earth's filter, without its "you
// control").
const MONARCH_TEXT = "Whenever your commander enters, you become the monarch.";
const PUMP_TEXT =
  "{2}, {T}: Put two +1/+1 counters on target creature or Vehicle. Activate only as a sorcery.";
const YOUR_COMMANDER = { isCommander: true, ownedBy: "you" } as const;

export default defineCard({
  name: "Nakia, Wakandan Operative",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${MONARCH_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: YOUR_COMMANDER },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      sorcerySpeed: true,
      text: PUMP_TEXT,
    },
  ],
});
