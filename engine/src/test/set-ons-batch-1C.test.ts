/**
 * Onslaught (ONS; B224), group C. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickModes,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("ONS group C", () => {
  it("Rotlung Reanimator: its own death and another Cleric's each make a Zombie", () => {
    const { game } = table();
    const first = spawn(game, "Rotlung Reanimator");
    spawn(game, "Rotlung Reanimator", B);
    destroy(game, first);
    // The dying one (this creature) and Bob's (another Cleric) both trigger.
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(tokensNamed(game, "Zombie Token", B)).toBe(1);
  });

  it("Strongarm Tactics: only a player who didn't discard a creature card loses 4", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const creature = toHand(game, "Rotlung Reanimator");
    const spell = toHand(game, "Strongarm Tactics");
    a.chooseDiscardsFn = () => [creature];
    cast(game, spell);
    expect(zone(game, creature)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(16);
  });

  it("Bloodline Shaman: a creature of the chosen type goes to hand, anything else to the graveyard", () => {
    const { game, a } = table();
    const shaman = spawn(game, "Bloodline Shaman");
    const top = toLibrary(game, "Rotlung Reanimator");
    a.chooseCreatureTypeFn = () => "Zombie";
    activate(game, shaman);
    expect(zone(game, top)).toBe("hand");

    const { game: g2, a: a2 } = table();
    const shaman2 = spawn(g2, "Bloodline Shaman");
    const top2 = toLibrary(g2, "Rotlung Reanimator");
    a2.chooseCreatureTypeFn = () => "Elf";
    activate(g2, shaman2);
    expect(zone(g2, top2)).toBe("graveyard");
  });

  it("Riptide Shapeshifter: puts the first creature card of the chosen type onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const shifter = spawn(game, "Riptide Shapeshifter");
    const found = toLibrary(game, "Rotlung Reanimator");
    toLibrary(game, "Bloodline Shaman"); // an Elf on top, passed over
    a.chooseCreatureTypeFn = () => "Cleric";
    activate(game, shifter);
    expect(zone(game, shifter)).toBe("graveyard");
    expect(zone(game, found)).toBe("battlefield");
    expect(named(game, "Bloodline Shaman", A).length).toBe(0);
  });

  it("Sigil of the New Dawn: pays {1}{W} to return a creature that died to its owner's hand", () => {
    const { game, a } = table();
    spawn(game, "Sigil of the New Dawn");
    lands(game, "Plains", 2);
    const victim = spawn(game, "Rotlung Reanimator");
    pickModes(a, 0);
    const before = hand(game).length;
    destroy(game, victim);
    expect(zone(game, victim)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).includes(victim)).toBe(false);
  });

  it("Exalted Angel: gains life equal to the damage it deals", () => {
    const { game, a } = table();
    const angel = spawn(game, "Exalted Angel");
    attack(game, a, [angel]);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("Lavamancer's Skill: a non-Wizard gets only the 1-damage ability", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const host = spawn(game, "Rotlung Reanimator");
    const victim = spawn(game, "Exalted Angel", B);
    const aura = toHand(game, "Lavamancer's Skill");
    cast(game, aura, { targets: [ref(host)] });
    activate(game, host, 0, { targets: [ref(victim)] });
    expect(game.state.objects[victim].damageMarked).toBe(1);
    expect(() => activate(game, host, 1, { targets: [ref(victim)] })).toThrow();
  });
});
