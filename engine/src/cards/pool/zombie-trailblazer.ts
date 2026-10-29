import { defineCard } from "../define.js";

const TAP_A_ZOMBIE = {
  mana: null,
  tap: false,
  tapOthers: { count: 1, filter: { subtype: "Zombie", controlledBy: "you" }, includeSelf: true },
} as const;

// "Becomes a Swamp" sets its land types (rule 305.7): it loses its other land
// types and rules-text abilities and taps for {B} until end of turn.
export default defineCard({
  name: "Zombie Trailblazer",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Scout"],
  power: 2,
  toughness: 2,
  text: "Tap an untapped Zombie you control: Target land becomes a Swamp until end of turn.\nTap an untapped Zombie you control: Target creature gains swampwalk until end of turn. (It can't be blocked as long as defending player controls a Swamp.)",
  activated: [
    {
      cost: TAP_A_ZOMBIE,
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Swamp"], duration: "end-of-turn" },
      resolve: null,
      text: "Tap an untapped Zombie you control: Target land becomes a Swamp until end of turn.",
    },
    {
      cost: TAP_A_ZOMBIE,
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "swampwalk", duration: "end-of-turn" },
      resolve: null,
      text: "Tap an untapped Zombie you control: Target creature gains swampwalk until end of turn.",
    },
  ],
});
