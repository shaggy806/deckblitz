/**
 * "Whenever ~ attacks and isn't blocked" (rule 509.3g — the `attacks-unblocked`
 * trigger, off `attacker-unblocked`), its delayed form ("this turn, when
 * target creature attacks and isn't blocked" — `{ attacksUnblocked }`), and
 * "assigns no combat damage this turn" (the `assigns-no-combat-damage`
 * effect, rule 510.1a). Farrel's Zealot, Mindstab Thrull, Necrite, Delif's
 * Cone and Delif's Cube.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  counters,
  hand,
  life,
  pickModes,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("attacks and isn't blocked", () => {
  it("triggers with no blockers declared, and its 'if you do' takes the combat damage away", () => {
    const { game, a } = table();
    const zealot = spawn(game, "Farrel's Zealot");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a, 0);
    attack(game, a, [zealot]);
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    // It assigned no combat damage to the defending player.
    expect(life(game, B)).toBe(20);
  });

  it("keeps the combat damage when you decline", () => {
    const { game, a } = table();
    const zealot = spawn(game, "Farrel's Zealot");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    pickModes(a);
    attack(game, a, [zealot]);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    expect(life(game, B)).toBe(18);
  });

  it("doesn't trigger for a blocked attacker", () => {
    const { game, a, b } = table();
    const zealot = spawn(game, "Farrel's Zealot");
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: zealot }];
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [zealot]);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(zone(game, zealot)).toBe("graveyard");
  });

  it("triggers when the defending player has nothing that could block", () => {
    const { game, a } = table();
    const thrull = spawn(game, "Mindstab Thrull");
    for (let i = 0; i < 4; i++) toHand(game, "Wastes", B);
    const before = hand(game, B).length;
    pickModes(a, 0);
    attack(game, a, [thrull]);
    expect(zone(game, thrull)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 3);
    // Sacrificed before combat damage: none dealt.
    expect(life(game, B)).toBe(20);
  });

  it("makes the player it attacked the defending player, in a three-player game", () => {
    const { game, a } = table({ players: 3 });
    const necrite = spawn(game, "Necrite");
    const atB = spawn(game, "Grizzly Bears", B);
    const atC = spawn(game, "Grizzly Bears", C);
    // Only C's creatures are "defending player controls" when Necrite attacks C.
    const seen = watchTargets(a, (offered) => [offered[0]?.[0] ?? null]);
    pickModes(a, 0);
    attack(game, a, [necrite], C);
    if (seen.asked > 0) expect(seen.offered[0]).toEqual([atC]);
    expect(zone(game, atC)).toBe("graveyard");
    expect(zone(game, atB)).toBe("battlefield");
    expect(zone(game, necrite)).toBe("graveyard");
  });
});

describe("this turn, when target creature attacks and isn't blocked", () => {
  it("Delif's Cone: gain life equal to its power, and it deals no combat damage", () => {
    const { game, a } = table();
    const cone = spawn(game, "Delif's Cone");
    const wurm = spawn(game, "Craw Wurm");
    activate(game, cone, 0, { targets: [ref(wurm)] });
    expect(zone(game, cone)).toBe("graveyard");
    pickModes(a, 0);
    attack(game, a, [wurm]);
    expect(life(game, A)).toBe(26);
    expect(life(game, B)).toBe(20);
  });

  it("Delif's Cone: nothing when the creature is blocked", () => {
    const { game, a, b } = table();
    const cone = spawn(game, "Delif's Cone");
    const wurm = spawn(game, "Craw Wurm");
    const wall = spawn(game, "Wall of Wood", B);
    activate(game, cone, 0, { targets: [ref(wurm)] });
    b.declareBlockersFn = () => [{ blocker: wall, attacker: wurm }];
    pickModes(a, 0);
    attack(game, a, [wurm]);
    expect(life(game, A)).toBe(20);
  });

  it("Delif's Cube: no combat damage, a cube counter, and the counter pays for a regeneration", () => {
    const { game, a } = table();
    const cube = spawn(game, "Delif's Cube");
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 4; i++) spawn(game, "Wastes");
    activate(game, cube, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
    expect(counters(game, cube, "cube")).toBe(1);
    activate(game, cube, 1, { targets: [ref(bears)] });
    expect(counters(game, cube, "cube")).toBe(0);
    expect(game.state.objects[bears].regenerationShields).toBe(1);
  });
});

describe("the unblocked trigger's defending player and its counts", () => {
  it("Guiltfeeder: the defending player loses 1 life per card in their own graveyard", () => {
    const { game, a } = table();
    const feeder = spawn(game, "Guiltfeeder");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes", B);
    toGraveyard(game, "Wastes", A);
    attack(game, a, [feeder]);
    expect(life(game, B)).toBe(17);
  });

  it("Cybermat: +X/+0 for each attacking artifact creature, itself included", () => {
    const { game, a } = table();
    const mat = spawn(game, "Cybermat");
    const other = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [mat, other, bears]);
    // 2 + 2 (Cybermat and Ornithopter), Ornithopter 0, Bears 2.
    expect(life(game, B)).toBe(20 - 4 - 0 - 2);
  });
});
