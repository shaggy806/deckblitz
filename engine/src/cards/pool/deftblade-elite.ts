import { defineCard } from "../define.js";

// EDHREC rank 23077.

export default defineCard({
  name: "Deftblade Elite",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "Provoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)\n{1}{W}: Prevent all combat damage that would be dealt to and dealt by this creature this turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: "source" }, combat: true },
          { kind: "damage-rule", by: { target: "source" }, combat: true },
        ],
      },
      resolve: null,
      text: "{1}{W}: Prevent all combat damage that would be dealt to and dealt by this creature this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: {
        kind: "may",
        prompt: "Provoke: untap that creature and have it block this one if able?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: 0 },
            { kind: "block-if-able", target: 0, attacker: "source" },
          ],
        },
      },
      resolve: null,
      text: "Provoke",
    },
  ],
});
