import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  enter,
  hand,
  life,
  lands,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Rally the Galadhrim", () => {
  it("with conspire paid, makes two token copies of the target", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const e1 = spawn(game, "Llanowar Elves");
    const e2 = spawn(game, "Llanowar Elves");
    pickModes(a, 0);
    pickPermanents(a, e1, e2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Rally the Galadhrim"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(2);
  });
});

describe("Rassilon, the War President", () => {
  it("upkeep: lose 2 life and exile the top card; a noncreature spell cast from exile has conspire", () => {
    const { game, a } = table();
    spawn(game, "Rassilon, the War President");
    spawn(game, "Mountain");
    const g1 = spawn(game, "Raging Goblin");
    const g2 = spawn(game, "Goblin Piker");
    const bolt = toLibrary(game, "Lightning Bolt");
    toStep(game, "precombat-main");
    expect(life(game, A)).toBe(18);
    expect(zone(game, bolt)).toBe("exile");
    pickModes(a, 0);
    pickPermanents(a, g1, g2);
    pickTargets(a, B);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(14);
  });

  it("a spell cast from hand isn't given conspire", () => {
    const { game, a } = table();
    spawn(game, "Rassilon, the War President");
    spawn(game, "Mountain");
    spawn(game, "Raging Goblin");
    spawn(game, "Goblin Piker");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(17);
  });
});

describe("Fire Nation Turret", () => {
  it("gives up to one target creature +2/+0 and firebending 2 at the beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Fire Nation Turret");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(game, bears).power).toBe(4);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "R").length).toBe(2);
  });

  it("removes fifty charge counters to deal 50 damage", () => {
    const { game } = table();
    const turret = spawn(game, "Fire Nation Turret");
    game.state.objects[turret].counters.charge = 50;
    activate(game, turret, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(-30);
    expect(game.state.objects[turret].counters.charge ?? 0).toBe(0);
  });
});

describe("Yuffie, Materia Hunter", () => {
  it("steals a noncreature artifact while you control her, and may attach an Equipment to her", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const splitter = spawn(game, "Bonesplitter");
    pickTargets(a, ring);
    pickPermanents(a, splitter);
    const yuffie = enter(game, "Yuffie, Materia Hunter");
    expect(controller(game, ring)).toBe(A);
    expect(game.state.objects[splitter].attachedTo).toBe(yuffie);
    destroy(game, yuffie);
    expect(controller(game, ring)).toBe(B);
  });
});

describe("Mists of Lórien", () => {
  it("returns the target and every other nonland permanent with its mana value", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const piker = spawn(game, "Goblin Piker");
    const giant = spawn(game, "Hill Giant", B);
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Mists of Lórien"), { targets: [ref(bears)] });
    expect(hand(game, B)).toContain(bears);
    expect(hand(game, A)).toContain(piker);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
  });
});
