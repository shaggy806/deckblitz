import { defineCard } from "../define.js";

// EDHREC rank 9003.
//
// Rulings:
//   [2024-03-08] You can choose not to have Synth Infiltrator enter the battlefield as a copy of
//     another creature. If you do, it will probably die due to having 0 toughness. (This is
//     probably not the kind of innovation the Institute would approve of.)
//   [2024-03-08] If the copied creature is a token, Synth Infiltrator copies the original
//     characteristics of that token as stated by the effect that created that token, with the
//     noted exceptions.
//   [2024-03-08] If the copied creature is copying something else, then Synth Infiltrator enters
//     the battlefield as whatever that creature copied, with the noted exceptions.
//   [2024-03-08] Except for being a Synth artifact creature in addition to its other types, Synth
//     Infiltrator copies exactly what was printed on the original creature and nothing else
//     (unless that creature is copying something else or is a token; see below). It doesn’t copy
//     whether that creature is tapped or untapped, whether it has any counters on it or Auras and
//     Equipment attached to it, or any non-copy effects that have changed its power, toughness,
//     types, color, and so on.
//   [2024-03-08] Any enters-the-battlefield abilities of the copied creature will trigger when
//     Synth Infiltrator enters the battlefield. Any “as [this creature] enters the battlefield” or
//     “[this creature] enters the battlefield with” abilities of the copied creature will also
//     work.
//   [2024-03-08] Improvise doesn’t change Synth Infiltrator’s mana cost or mana value, and it
//     can’t reduce Synth Infiltrator’s cost below {U}{U}.
//   [2024-03-08] If the copied creature has {X} in its mana cost, X is 0.

export default defineCard({
  name: "Synth Infiltrator",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Synth"],
  power: 0,
  toughness: 0,
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nYou may have this creature enter as a copy of any creature on the battlefield, except it's a Synth artifact creature in addition to its other types.",
  copyOnEnter: {
    filter: { type: "creature" },
    except: { addTypes: ["artifact", "creature"], addSubtypes: ["Synth"] },
  },
});
