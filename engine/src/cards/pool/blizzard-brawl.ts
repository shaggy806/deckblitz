import { defineCard } from "../define.js";

export default defineCard({
  name: "Blizzard Brawl",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["sorcery"],
  text: "Choose target creature you control and target creature you don't control. If you control three or more snow permanents, the creature you control gets +1/+0 and gains indestructible until end of turn. Then those creatures fight each other. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  // The snow count is read as it resolves (the ruling); the bonus still
  // applies when only the creature you control is still a legal target.
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 3 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
