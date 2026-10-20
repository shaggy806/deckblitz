import { defineCard } from "../define.js";

// Every attacking creature, whoever controls it, skips its next untap — none
// is tapped by this (`tap-all`'s `onlyDoesntUntap`); an attacker with
// vigilance stays untapped now.
export default defineCard({
  name: "Tangle",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn.\nEach attacking creature doesn't untap during its controller's next untap step.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-all-combat-damage" },
      { kind: "tap-all", filter: { type: "creature", attacking: true }, doesntUntapNext: true, onlyDoesntUntap: true },
    ],
  },
});
