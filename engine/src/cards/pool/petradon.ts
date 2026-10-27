import { defineCard } from "../define.js";

// The two lands are exiled linked to Petradon (rule 607.2a), and its leaves
// trigger returns exactly those (Worldgorger Dragon's shape). If Petradon
// leaves before its enters trigger resolves, the return comes first and
// finds nothing, so the lands stay exiled.

export default defineCard({
  name: "Petradon",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Nightmare", "Beast"],
  power: 5,
  toughness: 6,
  text: "When this creature enters, exile two target lands.\nWhen this creature leaves the battlefield, return the exiled cards to the battlefield under their owners' control.\n{R}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "land", min: 2, max: 2 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: "When this creature enters, exile two target lands.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled cards to the battlefield under their owners' control.",
    },
  ],
});
