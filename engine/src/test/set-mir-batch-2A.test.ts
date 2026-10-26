/**
 * Mirage (MIR), batch 2, group A.
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
  nextTurn,
  pickModes,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";

describe("Catacomb Dragon", () => {
  it("a nonartifact, non-Dragon blocker gets -X/-0, X half its power rounded down", () => {
    const { game, a, b } = table();
    const dragon = spawn(game, "Catacomb Dragon");
    const djinn = spawn(game, "Mahamoti Djinn", B);
    b.declareBlockersFn = () => [{ blocker: djinn, attacker: dragon }];
    attack(game, a, [dragon]);
    expect(pt(game, djinn)).toEqual({ power: 3, toughness: 6 });
  });

  it("a Dragon blocker is left alone", () => {
    const { game, a, b } = table();
    const dragon = spawn(game, "Catacomb Dragon");
    const shivan = spawn(game, "Shivan Dragon", B);
    b.declareBlockersFn = () => [{ blocker: shivan, attacker: dragon }];
    attack(game, a, [dragon]);
    expect(pt(game, shivan).power).toBe(5);
  });
});

describe("Vitalizing Cascade", () => {
  it("gains X plus 3 life", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Vitalizing Cascade"), { x: 4 });
    expect(life(game, A)).toBe(27);
  });
});

describe("Dream Fighter", () => {
  it("it and the creature blocking it phase out", () => {
    const { game, a, b } = table();
    const fighter = spawn(game, "Dream Fighter");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: fighter }];
    attack(game, a, [fighter]);
    expect(zone(game, fighter)).toBe("phased-out");
    expect(zone(game, bears)).toBe("phased-out");
  });

  it("it and the creature it blocks phase out", () => {
    const { game, a, b } = table();
    const fighter = spawn(game, "Dream Fighter");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: fighter, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, fighter)).toBe("phased-out");
    expect(zone(game, bears)).toBe("phased-out");
    expect(life(game, A)).toBe(20);
  });
});

describe("Cinder Cloud", () => {
  it("a white creature destroyed deals its power to its controller", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Cinder Cloud"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });

  it("a nonwhite creature deals nothing", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Cinder Cloud"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Ethereal Champion", () => {
  it("1 life prevents the next 1 damage to it", () => {
    const { game } = table();
    const champion = spawn(game, "Ethereal Champion");
    activate(game, champion, 0);
    expect(life(game, A)).toBe(19);
    game.debugApplyEffect(B, { kind: "damage", amount: 4, target: 0 }, [ref(champion)]);
    game.advanceUntil(quiet);
    expect(zone(game, champion)).toBe("battlefield");
  });
});

describe("Jungle Patrol", () => {
  it("makes a Wood, and a token named Wood sacrifices for {R}", () => {
    const { game } = table();
    const patrol = spawn(game, "Jungle Patrol");
    lands(game, "Forest", 2);
    activate(game, patrol, 0);
    expect(tokensNamed(game, "Wood Token", A)).toBe(1);
    const wood = game.battlefield.find((id) => game.state.objects[id].cardName === "Wood Token")!;
    const bears = spawn(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: patrol, abilityIndex: 1, targets: [], sacrifice: bears })).not.toBeNull();
    game.dispatch({ type: "activate-ability", player: A, source: patrol, abilityIndex: 1, targets: [], sacrifice: wood });
    game.advanceUntil(quiet);
    expect(tokensNamed(game, "Wood Token", A)).toBe(0);
    expect(game.state.players[A].manaPool.some((unit) => unit.type === "R")).toBe(true);
  });
});

describe("Decomposition", () => {
  it("gives the black creature cumulative upkeep in life, paid by its controller", () => {
    const { game, b } = table();
    const knight = spawn(game, "Black Knight", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Decomposition"), { targets: [ref(knight)] });
    pickModes(b, 0);
    nextTurn(game);
    expect(counters(game, knight, "age")).toBe(1);
    expect(zone(game, knight)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("when it dies, its controller loses 2 life", () => {
    const { game } = table();
    const knight = spawn(game, "Black Knight", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Decomposition"), { targets: [ref(knight)] });
    destroy(game, knight, A);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Unerring Sling", () => {
  it("deals the tapped creature's power to an attacking flier", () => {
    const { game, a } = table();
    const sling = spawn(game, "Unerring Sling");
    const wurm = spawn(game, "Craw Wurm");
    const angel = spawn(game, "Serra Angel");
    lands(game, "Wastes", 3);
    a.declareAttackersFn = () => [{ attacker: angel, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    game.dispatch({ type: "activate-ability", player: A, source: sling, abilityIndex: 0, targets: [ref(angel)], tap: [wurm] });
    game.advanceUntil(quiet);
    expect(game.state.objects[wurm].tapped).toBe(true);
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Ravenous Vampire", () => {
  it("sacrificing a nonartifact creature puts a counter on it", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Ravenous Vampire");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, vampire)).toBe(1);
    expect(game.state.objects[vampire].tapped).toBe(false);
  });

  it("is tapped if nothing is sacrificed", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Ravenous Vampire");
    pickModes(a);
    toStep(game, "draw");
    expect(game.state.objects[vampire].tapped).toBe(true);
    expect(counters(game, vampire)).toBe(0);
  });
});

describe("Gibbering Hyenas", () => {
  it("can't block a black creature", () => {
    const { game, a } = table();
    const knight = spawn(game, "Black Knight");
    const bears = spawn(game, "Grizzly Bears");
    const hyenas = spawn(game, "Gibbering Hyenas", B);
    a.declareAttackersFn = () => [
      { attacker: knight, defender: B },
      { attacker: bears, defender: B },
    ];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game.legalActions(B).find((o): o is BlockOffer => o.kind === "declare-blockers");
    expect(offer?.eligible.find((e) => e.blocker === hyenas)?.canBlock).toEqual([bears]);
  });
});

describe("Wave Elemental", () => {
  it("taps up to three creatures without flying, not a flier", () => {
    const { game } = table();
    const wave = spawn(game, "Wave Elemental");
    const [x, y, z] = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B), spawn(game, "Craw Wurm", B)];
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 1);
    expect(() => activate(game, wave, 0, { targets: [ref(angel), null, null], settle: false })).toThrow();
    activate(game, wave, 0, { targets: [ref(x), ref(y), ref(z)] });
    expect(zone(game, wave)).toBe("graveyard");
    expect([x, y, z].every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Hivis of the Scale", () => {
  it("holds a Dragon while it stays tapped", () => {
    const { game } = table();
    const hivis = spawn(game, "Hivis of the Scale");
    const shivan = spawn(game, "Shivan Dragon", B);
    activate(game, hivis, 0, { targets: [ref(shivan)] });
    expect(game.state.objects[shivan].controller).toBe(A);
  });
});
