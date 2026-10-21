/**
 * Limited Edition Alpha (LEA; B130), group E. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Terror", () => {
  it("can't target an artifact or black creature, and the one it destroys can't regenerate", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const black = spawn(game, "Lord of the Pit", B);
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Swamp", 2);
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(bears)]);
    const terror = toHand(game, "Terror");
    expect(() => cast(game, terror, { targets: [ref(black)] })).toThrow();
    expect(() => cast(game, terror, { targets: [ref(thopter)] })).toThrow();
    cast(game, terror, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Hurricane", () => {
  it("deals X to each flier and each player, not to ground creatures", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Hurricane"), { x: 4 });
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(16);
  });
});

describe("Gauntlet of Might", () => {
  it("gives every red creature +1/+1, and a Mountain tapped for mana makes an extra {R}", () => {
    const { game } = table();
    spawn(game, "Gauntlet of Might");
    const piker = spawn(game, "Goblin Piker", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, piker)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    // One Mountain pays for {1}{R}.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Strike"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Lord of the Pit", () => {
  it("makes you sacrifice another creature at upkeep, and deals you 7 when you can't", () => {
    const { game } = table();
    spawn(game, "Lord of the Pit");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(13);
  });
});

describe("Regeneration", () => {
  it("regenerates the enchanted creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    const aura = toHand(game, "Regeneration");
    cast(game, aura, { targets: [ref(bears)] });
    activate(game, aura, 0);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Castle", () => {
  it("gives only your untapped creatures +0/+2", () => {
    const { game } = table();
    spawn(game, "Castle");
    const untapped = spawn(game, "Grizzly Bears");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, untapped)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, tapped)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Spell Blast", () => {
  it("counters only a spell whose mana value is X", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    const blast = toHand(game, "Spell Blast");
    expect(() => cast(game, blast, { x: 2, targets: [ref(divination)], settle: false })).toThrow();
    cast(game, blast, { x: 3, targets: [ref(divination)] });
    expect(zone(game, divination)).toBe("graveyard");
    expect(zone(game, blast)).toBe("graveyard");
  });
});

describe("Fungusaur", () => {
  it("gets a +1/+1 counter when it's dealt damage", () => {
    const { game } = table();
    const fungusaur = spawn(game, "Fungusaur");
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(fungusaur)]);
    settle(game);
    expect(counters(game, fungusaur)).toBe(1);
    expect(pt(game, fungusaur)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Blue Ward", () => {
  it("gives the enchanted creature protection from blue", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Blue Ward"), { targets: [ref(bears)] });
    expect(() => cast(game, toHand(game, "Unsummon"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Ivory Cup", () => {
  it("lets you pay {1} to gain 1 life when a player casts a white spell", () => {
    const { game, a } = table();
    spawn(game, "Ivory Cup");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Savannah Lions"));
    expect(life(game, A)).toBe(21);
  });
});

describe("Wooden Sphere", () => {
  it("doesn't trigger on a nongreen spell", () => {
    const { game, a } = table();
    spawn(game, "Wooden Sphere");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Savannah Lions"));
    expect(life(game, A)).toBe(20);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(21);
  });
});

describe("Creature Bond", () => {
  it("deals the dead creature's toughness to its controller", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Stone", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Creature Bond"), { targets: [ref(wall)] });
    destroy(game, wall, A);
    expect(life(game, B)).toBe(12);
    expect(life(game, A)).toBe(20);
  });
});

describe("Volcanic Eruption", () => {
  it("destroys X Mountains and deals that many to each creature and each player", () => {
    const { game } = table();
    const [m1, m2] = lands(game, "Mountain", 2, B);
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Wall of Stone");
    lands(game, "Island", 5);
    cast(game, toHand(game, "Volcanic Eruption"), { x: 2, targets: [ref(m1), ref(m2)] });
    expect(zone(game, m1)).toBe("graveyard");
    expect(zone(game, m2)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wall].damageMarked).toBe(2);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Thicket Basilisk", () => {
  it("destroys a non-Wall creature it blocks at end of combat", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const basilisk = spawn(game, "Thicket Basilisk", B);
    // Big enough to survive the combat damage itself.
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 0, toughness: 5, duration: "end-of-turn" }, [ref(bears)]);
    b.declareBlockersFn = () => [{ blocker: basilisk, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, basilisk)).toBe("battlefield");
  });

  it("doesn't destroy a Wall that blocks it", () => {
    const { game, a, b } = table();
    const basilisk = spawn(game, "Thicket Basilisk");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: basilisk }];
    attack(game, a, [basilisk]);
    expect(zone(game, wall)).toBe("battlefield");
  });
});
