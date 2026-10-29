import { defineCard } from "../define.js";

// The creature isn't removed from combat; only its combat damage, both ways,
// is prevented for the turn (the rulings) — two damage rules, as Dovin,
// Hand of Control's.
export default defineCard({
  name: "Ith, High Arcanist",
  manaCost: "{5}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance"],
  suspend: { n: 4, cost: "{W}{U}" },
  text: "Vigilance\n{T}: Untap target attacking creature. Prevent all combat damage that would be dealt to and dealt by that creature this turn.\nSuspend 4—{W}{U}",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "damage-rule", to: { target: 0 }, combat: true },
          { kind: "damage-rule", by: { target: 0 }, combat: true },
        ],
      },
      resolve: null,
      text: "{T}: Untap target attacking creature. Prevent all combat damage that would be dealt to and dealt by that creature this turn.",
    },
  ],
});
