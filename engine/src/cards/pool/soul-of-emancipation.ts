import { defineCard } from "../define.js";

// Streets of New Capenna Commander.
//
// Rulings:
//   [2022-04-29] If a permanent is still a legal target as Soul of Emancipation's triggered ability
//     resolves but it isn't destroyed, perhaps because it had a shield counter, its controller will
//     create an Angel token for that permanent.
//   [2022-04-29] If a permanent is no longer a legal target as Soul of Emancipation's triggered
//     ability resolves, that target's controller will not create an Angel for that permanent.
//
// "Up to three other target nonland permanents" is an `any-number` group of
// at most three, destroyed as one instruction (`simultaneous`); then
// Cavalier of Dawn's "its controller creates" for each member still legal
// — a member found illegal as it resolves is left out of `for-each-target`
// (rule 608.2b), and a destroyed one's controller is as it last existed
// (rule 111.11), whether or not the destroy took.
const TEXT =
  "When this creature enters, destroy up to three other target nonland permanents. For each of those permanents, its controller creates a 3/3 white Angel creature token with flying.";

export default defineCard({
  name: "Soul of Emancipation",
  manaCost: "{4}{G}{W}{U}",
  colors: ["G", "W", "U"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 5,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "other", of: "nonland-permanent" }, max: 3 }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
          {
            kind: "for-each-target",
            from: 0,
            effect: { kind: "create-token", token: "3/3 White Angel Token", count: 1, who: "target-controller" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
