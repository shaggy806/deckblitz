import { defineCard } from "../define.js";

const TEXT =
  "{R}{G}: This creature gets +1/+1 until end of turn. If mana from a Treasure was spent to activate this ability, put a +1/+1 counter on this creature instead.";

// EDHREC rank 26073. What paid for this activation (rule 602.2b), read as it
// resolves.
export default defineCard({
  name: "Jetmir's Fixer",
  manaCost: "{R}{G}",
  colors: ["G", "R"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "ability-mana-spent", clauses: [{ from: { subtype: "Treasure" } }] },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        else: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
