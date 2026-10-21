import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Time Elemental", () => {
  it("is sacrificed at end of combat after attacking and deals 5 damage to you", () => {
    const { game, a } = table();
    const elemental = spawn(game, "Time Elemental");
    attack(game, a, [elemental]);
    expect(zone(game, elemental)).toBe("graveyard");
    expect(life(game, A)).toBe(15);
  });

  it("can't return an enchanted permanent", () => {
    const { game } = table();
    const elemental = spawn(game, "Time Elemental");
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const strength = spawn(game, "Holy Strength", B);
    game.state.objects[strength].attachedTo = bears;
    expect(() => activate(game, elemental, 0, { targets: [ref(bears)] })).toThrow();
    const other = spawn(game, "Grizzly Bears", B);
    activate(game, elemental, 0, { targets: [ref(other)] });
    expect(zone(game, other)).toBe("hand");
  });
});

describe("Disharmony", () => {
  it("can't be cast outside combat; in declare attackers it untaps, removes and steals the attacker", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    const card = toHand(game, "Disharmony");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, card, { targets: [ref(theirs)] })).toThrow();
    b.declareAttackersFn = () => [{ attacker: theirs, defender: A }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.turn.number === 2 && s.priority.holder === A,
    );
    expect(game.state.objects[theirs].tapped).toBe(true);
    cast(game, card, { targets: [ref(theirs)] });
    expect(controller(game, theirs)).toBe(A);
    expect(game.state.objects[theirs].tapped).toBe(false);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === B);
    expect(life(game, A)).toBe(20);
  });
});

describe("Relic Bind", () => {
  it("deals 1 damage to the chosen player when the enchanted artifact becomes tapped", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const bind = spawn(game, "Relic Bind");
    game.state.objects[bind].attachedTo = ring;
    pickModes(a, 0);
    pickTargets(a, B);
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(ring)]);
    settle(game);
    expect(life(game, B)).toBe(19);
  });
});

describe("Cosmic Horror", () => {
  it("unpaid, is destroyed and deals 7 damage to you", () => {
    const { game, a } = table({ step: "end" });
    const horror = spawn(game, "Cosmic Horror");
    pickModes(a); // don't pay
    toStep(game, "draw");
    expect(zone(game, horror)).toBe("graveyard");
    expect(life(game, A)).toBe(13);
  });

  it("deals no damage if it isn't destroyed (indestructible)", () => {
    const { game, a } = table({ step: "end" });
    const horror = spawn(game, "Cosmic Horror");
    game.debugApplyEffect(A, { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "permanent" }, [
      ref(horror),
    ]);
    pickModes(a);
    toStep(game, "draw");
    expect(zone(game, horror)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });
});

describe("Giant Slug", () => {
  it("gains the chosen landwalk at your next upkeep, until that turn ends", () => {
    const { game, a } = table();
    const slug = spawn(game, "Giant Slug");
    lands(game, "Wastes", 5);
    activate(game, slug, 0);
    expect(keywords(game, slug).has("swampwalk")).toBe(false);
    pickModes(a, 2); // Swamp
    toStep(game, "draw");
    expect(keywords(game, slug).has("swampwalk")).toBe(true);
    expect(keywords(game, slug).has("islandwalk")).toBe(false);
    toStep(game, "draw");
    expect(keywords(game, slug).has("swampwalk")).toBe(false);
  });
});

describe("Wall of Putrid Flesh", () => {
  it("prevents damage from an enchanted creature only", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Putrid Flesh");
    const plain = spawn(game, "Grizzly Bears", B);
    const enchanted = spawn(game, "Grizzly Bears", B);
    const aura = spawn(game, "Unholy Strength", B);
    game.state.objects[aura].attachedTo = enchanted;
    game.debugApplyEffect(B, { kind: "fight", a: 0, b: 1, oneSided: true }, [ref(enchanted), ref(wall)]);
    settle(game);
    expect(game.state.objects[wall].damageMarked).toBe(0);
    game.debugApplyEffect(B, { kind: "fight", a: 0, b: 1, oneSided: true }, [ref(plain), ref(wall)]);
    settle(game);
    expect(game.state.objects[wall].damageMarked).toBe(2);
  });
});

describe("Life Matrix", () => {
  it("only during your upkeep, gives a creature a matrix counter it can spend to regenerate", () => {
    const { game } = table();
    const matrix = spawn(game, "Life Matrix");
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, matrix, 0, { targets: [ref(bears)] })).toThrow();
    toStep(game, "upkeep");
    activate(game, matrix, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "matrix")).toBe(1);
    toStep(game, "precombat-main");
    activate(game, bears, 0);
    expect(counters(game, bears, "matrix")).toBe(0);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Elder Spawn", () => {
  it("without an Island to sacrifice, is sacrificed and deals 6 damage to you", () => {
    const { game } = table({ step: "end" });
    const spawnId = spawn(game, "Elder Spawn");
    toStep(game, "draw");
    expect(zone(game, spawnId)).toBe("graveyard");
    expect(life(game, A)).toBe(14);
  });

  it("stays when you sacrifice an Island", () => {
    const { game, a } = table({ step: "end" });
    const spawnId = spawn(game, "Elder Spawn");
    const [island] = lands(game, "Island", 1);
    pickModes(a, 0);
    pickPermanents(a, island);
    toStep(game, "draw");
    expect(zone(game, spawnId)).toBe("battlefield");
    expect(zone(game, island)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });
});

describe("Mold Demon", () => {
  it("is sacrificed with only one Swamp; two Swamps keep it", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const first = enter(game, "Mold Demon");
    expect(zone(game, first)).toBe("graveyard");
    const swamps = lands(game, "Swamp", 1);
    const all = [...swamps, ...game.battlefield.filter((id) => game.state.objects[id].cardName === "Swamp" && id !== swamps[0])];
    pickModes(a, 0);
    pickPermanents(a, ...all);
    const second = enter(game, "Mold Demon");
    expect(zone(game, second)).toBe("battlefield");
    for (const id of all) expect(zone(game, id)).toBe("graveyard");
  });
});

describe("Ivory Guardians", () => {
  it("each Guardians pumps every creature named Ivory Guardians while an opponent has a nontoken red permanent", () => {
    const { game } = table();
    const one = spawn(game, "Ivory Guardians");
    const two = spawn(game, "Ivory Guardians");
    game.debugApplyEffect(B, { kind: "create-token", token: "Goblin Token", count: 1 }, []);
    settle(game);
    expect(pt(game, one)).toEqual({ power: 3, toughness: 3 }); // a token doesn't count
    spawn(game, "Raging Goblin", B);
    expect(pt(game, one)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, two)).toEqual({ power: 5, toughness: 5 });
  });
});
